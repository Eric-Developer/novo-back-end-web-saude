import multer, { FileFilterCallback } from 'multer';

const upload = multer({
  dest: 'health-unit/',
  fileFilter: (req, file, cb: FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          'Tipo de arquivo inválido. Aceitamos apenas JPEG, PNG, WEBP e JPG.'
        )
      );
    }
    cb(null, true);
  },
});

export default upload;
