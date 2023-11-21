const multer = require('multer')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./src/public/images")
    },
    filename: function (req, file, cb) {


        let fileExtension = undefined;
        //check if file have a extension 
        if (file.originalname.split(".").length > 1) {
            fileExtension = file.originalname.substring(
                file.originalname.lastIndexOf(".")
            )
        }
        // take filename without extensioin from orignal name
        const filenameWithoutExtension = file.originalname
            .toLowerCase()
            .split(" ")
            .join("-")
            ?.split(".")[0];
        cb( // add randomnumber between filename and extension to prevent same name
            null,
            filenameWithoutExtension +
            Date.now() +
            Math.ceil(Math.random() * 1e5) + // avoid rare name conflict
            fileExtension
        );
    }
})

const upload = multer({
    storage
})

module.exports = upload
/*
//upload.single()
req.file
{
    fieldname: 'fileInput',
        originalname: 'example.jpg',
            encoding: '7bit',
                mimetype: 'image/jpeg',
                    destination: '/public/images',
                        filename: 'example-1634648455489-23567.jpg',
                            path: '/public/images/example-1634648455489-23567.jpg',
                                size: 123456
}

// upload.array()
// req.files looks like 
[
    {
        fieldname: 'fileInput',
        originalname: 'file1.jpg',
        // ... other file properties
    },
    {
        fieldname: 'fileInput',
        originalname: 'file2.png',
        // ... other file properties
    },
    {
        fieldname: 'fileInput',
        originalname: 'file3.pdf',
        // ... other file properties
    }
]


// once we place uploads in routes then we can use req.files inside the contorllers
// upload.fields() ,
req.files looks like =>

{
  mainImage: [
    {
      fieldname: 'mainImage',
      originalname: 'Screenshot (117).png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: 'public/images',
      filename: 'screenshot-(117)169563336804337572.png',
      path: 'public\\images\\screenshot-(117)169563336804337572.png',
      size: 379762
    }
  ],
  subImages: [
    {
      fieldname: 'subImages',
      originalname: 'Screenshot (122).png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: 'public/images',
      filename: 'screenshot-(122)169563336805197275.png',
      path: 'public\\images\\screenshot-(122)169563336805197275.png',
      size: 684581
    }, {
      fieldname: 'subImages',
      originalname: 'Screenshot (134).png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: 'public/images',
      filename: 'screenshot-(134)169563336808292828.png',
      path: 'public\\images\\screenshot-(134)169563336808292828.png',
      size: 669843
    },
    {
      fieldname: 'subImages',
      originalname: 'Screenshot (135).png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: 'public/images',
      filename: 'screenshot-(135)169563336809550438.png',
      path: 'public\\images\\screenshot-(135)169563336809550438.png',
      size: 669759
    }
  ]
}

*/