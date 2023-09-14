const express = require('express');
const app = express() ;
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const cors = require('cors');  
app.use(cors());
app.use(bodyParser.json()); 

app.post('/convert-to-pdf', async (req, res) => {
    const { quillContent } = req.body;
  
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(quillContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf();
    await browser.close();
  
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
    res.send(pdfBuffer);
  });
  
    
  app.listen(4000, () => {
    console.log('Server is running on port 4000');
  });
  