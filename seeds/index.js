const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {

});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

// async function seedImg(){
//     try{
//         const resp = await axios.get('https://api.unsplash.com/photos/random', {
//             params: {
//                 client_id: '27WMaSGzsJL7vKqG36q3TcXTR_ib-k7CvrZknmVsOD8',
//                 collections: 483251
//             },
//         })
//         return resp.data.urls.small 
//     } catch(err) {
//         console.log(err)
//     }
// }

//this variable function seeds the information into the database after
//being called in terminal with node seeds/index.js 
const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i = 0; i < 100; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //My user ID I got from mongoDB. Different for each computer I run this on
            author: '626be24505405df9e514b6ee',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Debitis, nihil tempora vel aspernatur quod aliquam illum! Iste impedit odio esse neque veniam molestiae eligendi commodi minus, beatae accusantium, doloribus quo!',
            price,
            //   image: 'https://source.unsplash.com/collection/483251',
            geometry: {
                type: 'Point',
                //Since city is already chosen above this just grabs the Long and Lat from the file
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [{
                    url: "https://res.cloudinary.com/dexterbad/image/upload/v1649741313/YelpCamp/cgr6a0xnyo7qtwzp9b0r.jpg",
                    filename: "YelpCamp/cgr6a0xnyo7qtwzp9b0r"
                },
                {
                    url: "https://res.cloudinary.com/dexterbad/image/upload/v1651434547/YelpCamp/btepjhuawst8lj75ewnv.jpg",
                    filename: "YelpCamp/btepjhuawst8lj75ewnv"
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});