import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({
});

// Upload

// const res = cloudinary.uploader.upload(
//   'https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg',
//   { public_id: 'olympic_flag' }
// );

// res
//   .then((data: { secure_url: any }) => {
//     console.log(data);
//     console.log(data.secure_url);
//   })
//   .catch((err: any) => {
//     console.log(err);
//   });

// // Generate
// const url = cloudinary.url('olympic_flag', {
//   width: 100,
//   height: 150,
//   Crop: 'fill',
// });

// // The output url
// console.log(url);
// // https://res.cloudinary.com/<cloud_name>/image/upload/h_150,w_100/olympic_flag
