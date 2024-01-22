import * as fs from 'fs';

class Color {
    red: number;
    green: number;
    blue: number;

    constructor(){
        this.red = 0;
        this.green = 0;
        this.blue = 0;

    }
}

class image {
    private pixels: Color[][];

    constructor(width: number, height: number) {
        this.pixels = new Array(width).fill(null).map(() => new Array(height).fill(null));
    }

    getWidth(): number {
        return this.pixels.length;
    }

    getHeight(): number {
        return this.pixels[0].length;
    }

    set(x: number, y: number, c: Color): void {
        this.pixels[x][y] = c;
    }

    get(x: number, y: number): Color {
        return this.pixels[x][y];
    }
}

class ImageEditor{

    constructor(){
        return;
    }
    public run(args: string[]){
        try{
            if(args.length < 3){
                this.usage();
                return;
            }
            let inputFile: string = args[0];
            let outputFile: string = args[1];
            let filter: string = args[2];
            
            let imageToEdit: image = this.read(inputFile);

            if (filter === "grayscale" || filter === "greyscale") {
                if (args.length !== 3) {
                    this.usage();
                    return;
                }
                this.grayscale(imageToEdit!);
            }
            else if (filter === "invert") {
                if (args.length !== 3) {
                    this.usage();
                    return;
                }
                this.invert(imageToEdit!)
            }
            else if (filter === "emboss") {
                if (args.length !== 3) {
                    this.usage();
                    return;
                }
                this.emboss(imageToEdit!);
            }
            else if (filter === "motionblur") {
                if (args.length !== 4) {
                    this.usage();
                    return;
                }

                const length: number = parseInt(args[3]);

                if (isNaN(length) || length < 0) {
                    this.usage();
                    return;
                }

                this.motionblur(imageToEdit!, length); // Assuming 'image' is not null here
            }
            else{
                this.usage();
            }
            this.write(imageToEdit, outputFile)
        }
        catch{
            console.error("Error");
        }
    }

    private grayscale( image:image):void {
		for (let x = 0; x < image.getWidth(); ++x) {
			for (let y = 0; y < image.getHeight(); ++y) {
				let curColor:Color = image.get(x, y);
								
				let grayLevel = Math.floor((curColor.red + curColor.green + curColor.blue) / 3);
				grayLevel = Math.max(0, Math.min(grayLevel, 255));
				
				curColor.red = grayLevel;
				curColor.green = grayLevel;
				curColor.blue = grayLevel;
			}
		}
	}
    private invert(image:image):void {
        console.log("Starting Emboss");
		for (let x = 0; x < image.getWidth(); ++x) {
			for (let y = 0; y < image.getHeight(); ++y) {
				let curColor: Color = image.get(x, y);
                console.log(curColor.red + " " + curColor.green + " " + curColor.blue);
				curColor.red = 255 - curColor.red;
				curColor.green = 255 - curColor.green;
				curColor.blue = 255 - curColor.blue;
			}
		}
	}

    private emboss(image:image):void {
		for (let x = image.getWidth() - 1; x >= 0; --x) {
			for (let y = image.getHeight() - 1; y >= 0; --y) {
				let curColor:Color = image.get(x, y);
				
				let diff = 0;
				if (x > 0 && y > 0) {
					let upLeftColor:Color = image.get(x - 1, y - 1);
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

    private motionblur( image: image, length:number):void {
		if (length < 1) {
			return;
		}	
		for (let x = 0; x < image.getWidth(); ++x) {
			for (let y = 0; y < image.getHeight(); ++y) {
				let curColor:Color = image.get(x, y);
				
				let maxX = Math.min(image.getWidth() - 1, x + length - 1);
				for (let i = x + 1; i <= maxX; ++i) {
					let tmpColor: Color = image.get(i, y);
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

    private usage(): void {
        console.log("USAGE: java ImageEditor <in-file> <out-file> <grayscale|invert|emboss|motionblur> {motion-blur-length}");
    }
    
    public read(filePath: string): image{
        let imageToEdit : image = new image(0,0);
        try {
            const file = fs.readFileSync(filePath, 'utf8');
            // const lines = file.split('\n');
            const dimensions = file.split(/\s+/);
            const width = parseInt(dimensions[1]);
            const height = parseInt(dimensions[2]);
    
            imageToEdit = new image(width, height);
            console.log(width + " " + height);
            let index: number = 4
            let count  = 0;
            for (let y = 0; y < height; ++y) {
                for (let x = 0; x < width; ++x) {
                    let color = new Color()
                    color.red = parseInt(dimensions[index]);
                    color.green = parseInt(dimensions[index + 1]);
                    color.blue = parseInt(dimensions[index + 2]);
                    index += 3;
                    imageToEdit.set(x,y,color);
                    console.log("Red: " + color.red + " Green: "+ color.green + " Blue: " + color.blue);
                    count++;
                }
            }
            console.log(count);
    
        }   
        catch{
            console.log("error");
        }
        return imageToEdit;
    }
    
    public write(image: image, filePath: string): void {
        try {
            console.log("entered try");
            const fileDescriptor = fs.openSync(filePath, 'w');
            fs.writeSync(fileDescriptor, "P3\n");
            fs.writeSync(fileDescriptor, `${image.getWidth()} ${image.getHeight()}\n`);
            fs.writeSync(fileDescriptor, "255\n");
    
            for (let y = 0; y < image.getHeight(); ++y) {
                console.log("Going throught height")
                for (let x = 0; x < image.getWidth(); ++x) {
                    const color = image.get(x, y);
                    fs.writeSync(fileDescriptor, `${x === 0 ? "" : " "} ${color.red} ${color.green} ${color.blue}`);
                }
                fs.writeSync(fileDescriptor, "\n");
            }
    
            fs.closeSync(fileDescriptor);
        } catch (error) {
            console.error(error);
        }
    }
    
    // write(read("source_images/feep.ppm"), "source_images/feep.ppm");
}

let imageEditor = new ImageEditor().run([ "source_images/penguins.ppm", "key_images/answer_penguins.ppm", "motionblur", "10"]);