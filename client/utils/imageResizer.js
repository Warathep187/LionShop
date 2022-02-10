import Resizer from "react-image-file-resizer";

const resizeFile = (file, maxW, maxH) =>
    new Promise((resolve) => {
        Resizer.imageFileResizer(
            file,
            maxW,
            maxH,
            "JPEG",
            100,
            0,
            (uri) => {
                resolve(uri);
            },
            "base64"
        );
    });

export default resizeFile;
