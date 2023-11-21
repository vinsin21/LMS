const fs = require('fs')

const getStaticFilePath = (req, fileName) => {
    return `${req.protocol}://${req.get('host')}/images/${fileName}`
}

const getLocalFilePath = (fileName) => {
    return `src/public/images/${fileName}`
}

const removeLocalFile = (filePath) => {
    fs.unlinkSync(filePath, (err) => {
        if (err) {
            console.log("error while removing local filePath", err)
        } else {
            console.log("file removed", filePath)
        }
    })
}


const removeUnusedMulterImageFilesOnError = (req) => {

    try {

        const multerFile = req?.file
        const multerFiles = req?.files

        if (multerFile) {
            removeLocalFile(multerFile.path)
        }

        if (multerFiles) {
            const filesArray = Object.values(multerFiles);

            filesArray.map((fileField) => {
                fileField.map((file) => {
                    removeLocalFile(file.path)
                })
            })
        }

    } catch (error) {
        // we are silently failing not thorwing any error
        console.log("Error while removing file", error)
    }
}

const getMongoosePaginationOptions = ({ page = 1, limit = 10, customLabels }) => {
    return {
        page: Math.max(page, 1),
        limit: Math.max(limit, 1),
        pagination: true,
        customLabels: {
            pagingCounter: "serialNumberStartFrom",
            ...customLabels
        }
    }
}


module.exports = {
    getStaticFilePath,
    getLocalFilePath,
    removeLocalFile,
    removeUnusedMulterImageFilesOnError,
    getMongoosePaginationOptions,

}