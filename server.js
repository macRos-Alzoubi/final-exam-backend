const express = require('express');

const cors = require('cors');

const axios = require('axios');

require('dotenv').config();

const server = express();

server.use(cors());

server.use(express.json());

const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});

const flowerSchema = new mongoose.Schema({
    instructions: String,
    photo: String,
    name: String
});

const ownerSchema = new mongoose.Schema({
    userEmail: String,
    flowers: [flowerSchema]
});

const ownerModel = mongoose.model('userFlower', ownerSchema);


const seedFun = () => {
    const roaaSchema = new flowerSchema({
        instructions: 'test instra.',
        photo: 'https://www.miraclegro.com/sites/g/files/oydgjc111/files/styles/scotts_asset_image_720_440/public/asset_images/main_021417_MJB_IMG_2241_718x404.jpg?itok=pbCu-Pt3',
        name: 'flower'
    });

    const roaaModel = new ownerModel({
        userEmail: 'roaa.abualeeqa@gmail.com',
        flowers: [roaaSchema]
    });

        const mySchema = new flowerSchema({
        instructions: 'test instra.',
        photo: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Flower_in_Horton_Plains_1.jpg',
        name: 'my flower'
    });

    const myModel = new ownerModel({
        userEmail: 'roaa.abualeeqa@gmail.com',
        flowers: [roaaSchema]
    });

    roaaModel.save();
    myModel.save();
};

// seedFun();

const getFlowersHanler = (req, res) => {
    axios
    .get(process.env.API_URL)
    .then(result => res.send(result.data.flowerslist))
    .catch(err => console.log(err));
};

const getUserFlowersHandler= (req, res) => {
    const {userEmail} = req.query;

    ownerModel.findOne({userEmail: userEmail}, (err, result) => {
        if(err)
            console.log(err);
        else if(!result)
            res.send([]);
        else
            res.send(result.flowers);
    });
};


const addFlowerHandler = (req, res) => {
    const {userEmail, flowerObj} = req.body;

     ownerModel.findOne({userEmail: userEmail}, (err, result) => {
        if(err)
            console.log(err);
        else if(!result){
            const newOwner = new ownerModel({
                userEmail: userEmail,
                flowers: [flowerObj]
            });
            newOwner.save();
        }
        else{
            result.flowers.unshift(flowerObj);
            result.save();
        }
    });
};

const updateFlowerHandler = (req, res) => {
    const {userEmail, flowerObj} = req.body;
    const {idx} = req.params;
         ownerModel.findOne({userEmail: userEmail}, (err, result) => {
        if(err)
            console.log(err);
        else{
            result.flowers[idx] = flowerObj;
            result.save().then(
                () => {
                    ownerModel.findOne({userEmail: userEmail}, (err, result) => {
                        if(err)
                            console.log(err);
                        else
                            res.send(result.flowers);
                    });
                }
            );
        }
    });
};


const deleteFlowerHandler = (req, res) => {
    const {userEmail} = req.query;
    const {idx} = req.params;
         ownerModel.findOne({userEmail: userEmail}, (err, result) => {
        if(err)
            console.log(err);
        else{
            result.flowers.splice(idx, 1);
            result.save().then(
                () => {
                    ownerModel.findOne({userEmail: userEmail}, (err, result) => {
                        if(err)
                            console.log(err);
                        else
                            res.send(result.flowers);
                    });
                }
            );
        }
    });
};


server.get('/getFlowers', getFlowersHanler);
server.get('/getUserFlowers', getUserFlowersHandler);
server.post('/addFlower', addFlowerHandler);
server.put('/updateFlower/:idx', updateFlowerHandler);
server.delete('/deleteFlower/:idx', deleteFlowerHandler);
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => console.log(`Listing to port ${PORT}`));