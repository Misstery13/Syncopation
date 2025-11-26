const canvas = document.getElementById('psychedelicCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Configuración de colores
const colors = {
    yellowBg: '#FFF176', // Amarillo claro
    yellowDiamond: '#FFFFFF', // Blanco
    blueBg: '#E1F5FE', // Azul muy claro
    blueDot: '#81D4FA', // Azul punto
};

// Elementos flotantes
const assets = [
    { type: 'note1', color: '#FF9800' }, 
    { type: 'note2', color: '#039BE5' }, 
    { type: 'star', color: '#FF5722' },  
    { type: 'star', color: '#29B6F6' }   
];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initParticles();
}

class Particle {
    constructor() {
        this.reset(true);
    }

    reset(randomY = false) {
        this.x = Math.random() * width;
        this.y = randomY ? Math.random() * height : height + 50;
        this.size = 20 + Math.random() * 25;
        this.speedY = 1 + Math.random() * 2;
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.08;
        
        const asset = assets[Math.floor(Math.random() * assets.length)];
        this.type = asset.type;
        this.color = asset.color;
        this.opacity = 0.7 + Math.random() * 0.3;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y < -50) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (this.type === 'star') {
            this.drawStar(0, 0, 5, this.size, this.size / 2);
        } else if (this.type === 'note1') {
            this.drawNote1(this.size);
        } else if (this.type === 'note2') {
            this.drawNote2(this.size);
        }

        ctx.restore();
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    drawNote1(size) {
        ctx.beginPath();
        ctx.ellipse(0, 0, size/2, size/3, -0.4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(size/2 - 2, -size/5);
        ctx.lineTo(size/2 - 2, -size * 1.5);
        ctx.stroke();
    }

    drawNote2(size) {
        ctx.beginPath();
        ctx.ellipse(-size/2, 0, size/2, size/3, -0.4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, -size/5);
        ctx.lineTo(0, -size * 1.5);
        ctx.lineTo(size/2, -size * 1.2); 
        ctx.stroke();
    }
}

function initParticles() {
    particles = [];
    const count = Math.floor((width * height) / 18000); 
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function drawPattern() {
    const tileSize = 60;
    const cols = Math.ceil(width / tileSize) + 1;
    const rows = Math.ceil(height / tileSize) + 1;

    const time = Date.now() * 0.02;
    const offsetX = Math.floor(time % (tileSize * 2));
    const offsetY = Math.floor(time % (tileSize * 2));

    for (let i = -2; i < cols; i++) {
        for (let j = -2; j < rows; j++) {
            const x = i * tileSize - offsetX;
            const y = j * tileSize + offsetY; 
            const isYellow = (i + j) % 2 === 0;

            if (isYellow) {
                ctx.fillStyle = colors.yellowBg;
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = colors.yellowDiamond;
                const pad = tileSize * 0.25;
                ctx.beginPath();
                ctx.moveTo(x + tileSize/2, y + pad); 
                ctx.lineTo(x + tileSize - pad, y + tileSize/2); 
                ctx.lineTo(x + tileSize/2, y + tileSize - pad); 
                ctx.lineTo(x + pad, y + tileSize/2); 
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillStyle = colors.blueBg;
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = colors.blueDot;
                const dotSize = 3;
                const gap = tileSize / 3;
                for(let dx=1; dx<=2; dx++) {
                    for(let dy=1; dy<=2; dy++) {
                        ctx.beginPath();
                        ctx.arc(x + dx*gap, y + dy*gap, dotSize, 0, Math.PI*2);
                        ctx.fill();
                    }
                }
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    drawPattern();
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
animate();