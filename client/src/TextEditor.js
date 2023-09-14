import React , {useCallback , useEffect , useState} from 'react'
import Quill from "quill"
import "quill/dist/quill.snow.css"
import io from 'socket.io-client'
import {useParams} from 'react-router-dom'
import axios from 'axios'; // Import axios for making HTTP requests

const SAVE_INTERVAL_MS = 5000 ;

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
  ]
  
const TextEditor = () => {
   const [socket , setSocket] = useState() ;
   const [quill, setQuill] = useState() ;
   const {id : documentId} = useParams() ;


  // Function to download the document as PDF
const downloadAsPDF = async () => {
  const quillContent = quill.root.innerHTML;

  // Send a POST request to the server to convert to PDF
  try {
    const response = await axios.post('http://localhost:4000/convert-to-pdf', { quillContent }, { responseType: 'blob' });

    // Create a blob from the response data
    const blob = new Blob([response.data], { type: 'application/pdf' });

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create an anchor element for downloading
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.pdf';
    a.style.display = 'none';

    // Add the anchor to the document and trigger the download
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error converting to PDF:', error);
  }
};




   // Making a socket connection to the server , handshake ho gaya bhaiya ... FULL DUPLEX : CONNECTION ESTABLISHED .
   useEffect(() =>{
       const s = io('http://localhost:4001') ;
       setSocket(s);
       return () =>{
          s.disconnect() ;
       }
   },[])


   // Persisting the Documents in the database 
   useEffect(() => {
    if (socket == null || quill == null) return

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents())
    }, SAVE_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [socket, quill])
  
   /* Getting and loading the document from the server belonging to the current room */
   useEffect(() => {
    if (socket == null || quill == null) return

    socket.once("load-document", document => {
      quill.setContents(document)
      quill.enable()
    })

    socket.emit("get-document", documentId)
  }, [socket, quill, documentId])



   /* For Emitting changes done by user to the server so that it can get broadcasted to other users in the room */
   useEffect(() => {
      if(socket === null || quill == null) return ;
       
      const handler = (delta,oldDelta,source) =>{
            if(source !== "user") return ;
            socket.emit("send-changes",delta);
      }
  
      quill.on("text-change",handler);

      return () => {
        quill.off("text-change",handler);
      }
   },[socket,quill]);


   /* For Updating the quill after getting broadcasted changes/messages from the server */

   useEffect(() => {
      if(socket == null || quill == null) return ;
      const handler = delta => {
        quill.updateContents(delta);
      }
      socket.on("receive-changes",handler);
      return () => {
        socket.off("receive-changes",handler);
      }
   },[socket,quill]);


  /* For Handling That Multiple editors dont get created due to rerendering and only one editor gets created */ 
  const wrapperRef = useCallback((wrapper)=>{
    if(wrapper == null) return ;
    wrapper.innerHTML = '' ;
    const editor = document.createElement("div")
    wrapper.append(editor);
    const q = new Quill(editor, {
        theme: 'snow' ,
        modules: { toolbar: TOOLBAR_OPTIONS }
      })
      q.disable()
      q.setText("Loading...")
      setQuill(q);
  },[])


  return (
    <div>
    <div id='container' ref={wrapperRef}> 
    </div>
    <button onClick={downloadAsPDF} style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '10px 20px', cursor: 'pointer', marginTop: '10px', textDecoration: 'none' }}>
       Download PDF
    </button>
    </div>
  )
}

export default TextEditor