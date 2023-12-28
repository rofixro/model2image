# model2image

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

Use model2image to display thumbnails of 3D models on a web page without requiring plugins or external programs.

## Install

```bash
npm install model2image
```

## Usage

```javascript
import { model2image } from 'model2image';

async function modelToImage() {
    const imageUrl = await model2image(modelUrl);
    console.log(imageUrl);
}
```

## Maintainers

[@Niyaco](https://github.com/niyaco)

## License

[MIT](https://github.com/niyaco/model2image/blob/main/LICENSE)
