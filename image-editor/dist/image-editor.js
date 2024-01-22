"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
class Color {
    red;
    green;
    blue;
    constructor() {
        this.red = 0;
        this.green = 0;
        this.blue = 0;
    }
}
class image {
    pixels;
    constructor(width, height) {
        this.pixels = new Array(width).fill(null).map(() => new Array(height).fill(null));
    }
    getWidth() {
        return this.pixels.length;
    }
    getHeight() {
        return this.pixels[0].length;
    }
    set(x, y, c) {
        this.pixels[x][y] = c;
    }
    get(x, y) {
        return this.pixels[x][y];
    }
}
class ImageEditor {
    constructor() {
        return;
    }
    run(args) {
        try {
            if (args.length < 3) {
                this.usage();
                return;
            }
            let inputFile = args[0];
            let outputFile = args[1];
            let filter = args[2];
            let imageToEdit = this.read(inputFile);
            if (filter === "grayscale" || filter === "greyscale") {
                if (args.length !== 3) {
                    this.usage();
                    return;
                }
                this.grayscale(imageToEdit);
            }
            else if (filter === "invert") {
                if (args.length !== 3) {
                    this.usage();
                    return;
                }
                this.invert(imageToEdit);
            }
            else if (filter === "emboss") {
                if (args.length !== 3) {
                    this.usage();
                    return;
                }
                this.emboss(imageToEdit);
            }
            else if (filter === "motionblur") {
                if (args.length !== 4) {
                    this.usage();
                    return;
                }
                const length = parseInt(args[3]);
                if (isNaN(length) || length < 0) {
                    this.usage();
                    return;
                }
                this.motionblur(imageToEdit, length); // Assuming 'image' is not null here
            }
            else {
                this.usage();
            }
            this.write(imageToEdit, outputFile);
        }
        catch {
            console.error("Error");
        }
    }
    grayscale(image) {
        for (let x = 0; x < image.getWidth(); ++x) {
            for (let y = 0; y < image.getHeight(); ++y) {
                let curColor = image.get(x, y);
                let grayLevel = Math.floor((curColor.red + curColor.green + curColor.blue) / 3);
                grayLevel = Math.max(0, Math.min(grayLevel, 255));
                curColor.red = grayLevel;
                curColor.green = grayLevel;
                curColor.blue = grayLevel;
            }
        }
    }
    invert(image) {
        console.log("Starting Emboss");
        for (let x = 0; x < image.getWidth(); ++x) {
            for (let y = 0; y < image.getHeight(); ++y) {
                let curColor = image.get(x, y);
                console.log(curColor.red + " " + curColor.green + " " + curColor.blue);
                curColor.red = 255 - curColor.red;
                curColor.green = 255 - curColor.green;
                curColor.blue = 255 - curColor.blue;
            }
        }
    }
    emboss(image) {
        for (let x = image.getWidth() - 1; x >= 0; --x) {
            for (let y = image.getHeight() - 1; y >= 0; --y) {
                let curColor = image.get(x, y);
                let diff = 0;
                if (x > 0 && y > 0) {
                    let upLeftColor = image.get(x - 1, y - 1);
                    if (Math.abs(curColor.red - upLeftColor.red) > Math.abs(diff)) {
                        diff = curColor.red - upLeftColor.red;
                    }
                    if (Math.abs(curColor.green - upLeftColor.green) > Math.abs(diff)) {
                        diff = curColor.green - upLeftColor.green;
                    }
                    if (Math.abs(curColor.blue - upLeftColor.blue) > Math.abs(diff)) {
                        diff = curColor.blue - upLeftColor.blue;
                    }
                }
                let grayLevel = (128 + diff);
                grayLevel = Math.max(0, Math.min(grayLevel, 255));
                curColor.red = grayLevel;
                curColor.green = grayLevel;
                curColor.blue = grayLevel;
            }
        }
    }
    motionblur(image, length) {
        if (length < 1) {
            return;
        }
        for (let x = 0; x < image.getWidth(); ++x) {
            for (let y = 0; y < image.getHeight(); ++y) {
                let curColor = image.get(x, y);
                let maxX = Math.min(image.getWidth() - 1, x + length - 1);
                for (let i = x + 1; i <= maxX; ++i) {
                    let tmpColor = image.get(i, y);
                    curColor.red += tmpColor.red;
                    curColor.green += tmpColor.green;
                    curColor.blue += tmpColor.blue;
                }
                let delta = (maxX - x + 1);
                curColor.red = Math.floor(curColor.red / delta);
                curColor.green = Math.floor(curColor.green / delta);
                curColor.blue = Math.floor(curColor.blue / delta);
            }
        }
    }
    usage() {
        console.log("USAGE: java ImageEditor <in-file> <out-file> <grayscale|invert|emboss|motionblur> {motion-blur-length}");
    }
    read(filePath) {
        let imageToEdit = new image(0, 0);
        try {
            const file = fs.readFileSync(filePath, 'utf8');
            // const lines = file.split('\n');
            const dimensions = file.split(/\s+/);
            const width = parseInt(dimensions[1]);
            const height = parseInt(dimensions[2]);
            imageToEdit = new image(width, height);
            console.log(width + " " + height);
            let index = 4;
            let count = 0;
            for (let y = 0; y < height; ++y) {
                for (let x = 0; x < width; ++x) {
                    let color = new Color();
                    color.red = parseInt(dimensions[index]);
                    color.green = parseInt(dimensions[index + 1]);
                    color.blue = parseInt(dimensions[index + 2]);
                    index += 3;
                    imageToEdit.set(x, y, color);
                    console.log("Red: " + color.red + " Green: " + color.green + " Blue: " + color.blue);
                    count++;
                }
            }
            console.log(count);
        }
        catch {
            console.log("error");
        }
        return imageToEdit;
    }
    write(image, filePath) {
        try {
            console.log("entered try");
            const fileDescriptor = fs.openSync(filePath, 'w');
            fs.writeSync(fileDescriptor, "P3\n");
            fs.writeSync(fileDescriptor, `${image.getWidth()} ${image.getHeight()}\n`);
            fs.writeSync(fileDescriptor, "255\n");
            for (let y = 0; y < image.getHeight(); ++y) {
                console.log("Going throught height");
                for (let x = 0; x < image.getWidth(); ++x) {
                    const color = image.get(x, y);
                    fs.writeSync(fileDescriptor, `${x === 0 ? "" : " "} ${color.red} ${color.green} ${color.blue}`);
                }
                fs.writeSync(fileDescriptor, "\n");
            }
            fs.closeSync(fileDescriptor);
        }
        catch (error) {
            console.error(error);
        }
    }
}
let imageEditor = new ImageEditor().run(["source_images/penguins.ppm", "key_images/answer_penguins.ppm", "motionblur", "10"]);
//# sourceMappingURL=image-editor.js.map