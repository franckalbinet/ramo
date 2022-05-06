
## Issues

### Print Background colours and images
Ref: https://stackoverflow.com/questions/3893986/css-media-print-issues-with-background-color

Fixed in Chromium using:

```css
body {
	position: relative;
	-webkit-print-color-adjust: exact !important;
	width: 100%;
	height: 100%;
}
```