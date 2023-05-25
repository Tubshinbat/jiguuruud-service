const Webinfo = require("../models/Webinfo");
const asyncHandler = require("express-async-handler");
const { imageDelete } = require("../lib/photoUpload");

//Utils
const MyError = require("../utils/myError");

exports.createWebinfo = asyncHandler(async (req, res) => {
  const { name, address, siteInfo, policy } = req.body;
  const lang = req.cookies.language || "mn";

  ["name", "address", "siteInfo", "policy"].map((el) => delete req.body[el]);

  req.body[lang] = {
    name,
    address,
    siteInfo,
    policy,
  };

  let webinfo = await Webinfo.create(req.body);

  res.status(200).json({
    sucess: true,
    data: webinfo,
  });
});


exports.getWebinfo = asyncHandler(async (req,res) => {
    const webInfo = await Webinfo.findOne().sort({
        createAt: -1
    })

    if(!webInfo){
        throw new MyError('өгөгдөл олдсонгүй.', 404)
    }
    res.status(200).json({
        success: true,
        data: webInfo
    })
});

exports.updateWebInfo = asyncHandler(async (req,res) => {
    const {name, address, siteInfo, policy, logo, whiteLogo} = req.body;
    const lang = req.cookies.language || 'mn'

    req.body[lang] = {
        name,
        address,
        siteInfo,
        policy,
        logo,
        whiteLogo
    }

    lang === 'eng' ? delete req.body.mn : delete req.body.eng;

    const webInfo = await Webinfo.findByIdAndUpdate(req.params.id, req.body, { 
        new: true,
        runValidators
    });

    res.status(200).json({
        success:true,
        data: webInfo,
    })
    

})