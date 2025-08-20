
const express = require("express");
const app = express();
const PORT = 8080;

app.use(express.json());

//used to store information about the url
let urlStore = {};

//For converting the long url to short url and store some details(like expiry, clicks, source which clicked) 
app.post("/shorturls", (req,res)=>{
    const url=req.body.url;
    const shortcode=req.body.shortcode;
    let validity=req.body.validity;
    if(!url||!shortcode){
        return res.status(400).json({error: `url, validity and shortcode are required - ${url} ${shortcode}`});
    }
    if(!validity){
        validity=30;
    }
    const expiry = new Date(Date.now() + validity * 60 * 1000);
    urlStore[shortcode] = {
        url,
        expiry,
        clicks: 0,
        clickData: []
    };


    const shortLink=`http://localhost:${PORT}/shorturls/${shortcode}`;
    return res.status(201).json({
        shortLink,
        expiry
    });
})


//This get request will jave the shorten url and get the information such as shortCode, originalUrl, clockDetails in json format
app.get("/shorturls/:shortcode", (req, res) => {
  const { shortcode } = req.params;
  const entry = urlStore[shortcode];

  if (!entry) {
    return res.status(404).json({ error: "Short link not found" });
  }

  return res.json({
    shortcode,
    originalUrl: entry.url,
    expiry: entry.expiry,
    totalClicks: entry.clicks,
    clickDetails: entry.clickData
  });
});

//This get request is used to open the link, and when opened, the click informations get updated
app.get("/:shortcode", (req, res) => {
  const { shortcode } = req.params;
  const entry = urlStore[shortcode];

  if (!entry) {
    return res.status(404).json({ error: "Short link not found" });
  }

  if (new Date() > entry.expiry) {
    return res.status(410).json({ error: "Short link has expired" });
  }

  entry.clicks++;
  entry.clickData.push({
    timestamp: new Date(),
    source: req.headers["user-agent"] || "unknown"
  });
  return res.json({Message : "Link opened sucessfully"})
 // return res.redirect(entry.url); 
 // I can't redirect as no such url/link exists really
});



//To run server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
