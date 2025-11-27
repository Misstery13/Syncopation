/**
 * ==========================================
 * CONFIGURACIÓN DEL FONDO ANIMADO (CANVAS)
 * ==========================================
 */

const canvas = document.getElementById('psychedelicCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// 🎨 CONFIGURACIÓN DE COLORES
// Cambia estos códigos HEX para alterar el tema del fondo (Tablero)
const colors = {
    yellowBg: '#FFF176',      // Color de fondo del cuadro 1 (Amarillo)
    yellowDiamond: '#FFFFFF', // Color del rombo dentro del cuadro 1
    blueBg: '#E1F5FE',        // Color de fondo del cuadro 2 (Azul)
    blueDot: '#81D4FA',       // Color de los lunares dentro del cuadro 2
};

// 🎭 ELEMENTOS FLOTANTES (PARTÍCULAS)
// Aquí defines qué formas aparecen flotando y sus colores.
// type: 'note1' (negra), 'note2' (corchea), 'star' (estrella)
const assets = [
    { type: 'note1', color: '#FF9800' }, // Naranja fuerte
    { type: 'note2', color: '#039BE5' }, // Azul fuerte
    { type: 'star', color: '#FF5722' },  // Rojo/Naranja
    { type: 'star', color: '#29B6F6' }   // Azul claro
];

// Función para ajustar el tamaño si el usuario cambia el tamaño de la ventana
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initParticles(); // Reinicia las partículas al cambiar tamaño
}

/**
 * CLASE PARTICLE
 * Controla cada nota o estrella individual
 */
class Particle {
    constructor() {
        this.reset(true); // true = iniciar en posición aleatoria en pantalla
    }

    // Reinicia la partícula (cuando sale de la pantalla o al inicio)
    reset(randomY = false) {
        // Posición X aleatoria
        this.x = Math.random() * width; 
        
        // Posición Y: Si es randomY, en cualquier lugar; si no, empieza abajo del todo
        this.y = randomY ? Math.random() * height : height + 50;
        
        // 📏 TAMAÑO: Base de 20px + aleatorio hasta 25px extra (Total: 20-45px)
        this.size = 15 + Math.random() * 20; 
        
        // 🚀 VELOCIDAD VERTICAL: Sube entre 1px y 3px por frame
        this.speedY = 0.5 + Math.random() * 2; 
        
        // 🌬️ VELOCIDAD HORIZONTAL (VIENTO): Se mueve un poco a los lados
        this.speedX = (Math.random() - 0.5) * 1; 
        
        // 🔄 ROTACIÓN
        this.rotation = Math.random() * Math.PI * 2; // Ángulo inicial
        this.rotationSpeed = (Math.random() - 0.5) * 0.06; // Velocidad de giro
        
        // Elegir una forma y color al azar de la lista 'assets'
        const asset = assets[Math.floor(Math.random() * assets.length)];
        this.type = asset.type;
        this.color = asset.color;
        
        // Transparencia (0.7 a 1.0)
        this.opacity = 0.7 + Math.random() * 0.3; 
    }

    // Actualiza la posición en cada frame
    update() {
        this.y -= this.speedY; // Mover hacia arriba
        this.x += this.speedX; // Mover lateralmente
        this.rotation += this.rotationSpeed; // Girar

        // ♻️ RECICLAJE: Si sale por arriba (-50px), reiniciar abajo
        if (this.y < -50) {
            this.reset();
        }
    }

    // Dibuja la partícula según su tipo
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4; // Grosor de línea para las notas musicales
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

    // --- FUNCIONES DE DIBUJO DE FORMAS ---
    
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
        // --- CABEZA DE LA NOTA ---
        ctx.beginPath();
        // El 5to número (0) es la rotación. Antes era -0.4 (inclinada).
        // size/2 es el ancho, size/3.5 es el alto (más achatada).
        ctx.ellipse(0, 0, size / 2, size / 3.5, 0, 0, 2 * Math.PI);
        ctx.fill();

        // --- EL PALITO (Plica) ---
        ctx.beginPath();
        ctx.lineWidth = 4; // Grosor del palito
        
        // Movemos el palito al borde derecho exacto de la cabeza
        const stemX = size / 2 - 2; 
        
        ctx.moveTo(stemX, 0);          // Empieza en el centro de la cabeza (altura)
        ctx.lineTo(stemX, -size * 2);  // Sube hacia arriba (negativo es arriba)
        ctx.stroke();
    }

    drawNote2(size) {
        // --- CABEZA DE LA NOTA ---
        ctx.beginPath();
        // Rotación en 0 para que esté recta
        ctx.ellipse(0, 0, size / 2, size / 3.5, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // --- EL PALITO (Plica) ---
        ctx.beginPath();
        ctx.lineWidth = 4;
        
        const stemX = size / 2 - 2; // Borde derecho
        
        ctx.moveTo(stemX, 0);
        ctx.lineTo(stemX, -size * 2); // Palito vertical
        
        // --- EL CORCHETE (La banderita) ---
        // Dibuja una curva suave hacia la derecha
        ctx.bezierCurveTo(
            stemX, -size * 2,         // Punto inicio (arriba del palito)
            stemX + size, -size * 1.5,// Punto de control (curvatura)
            stemX + size/2, -size * 0.5 // Punto final (cerca de la cabeza)
        );
        ctx.stroke();
    }
}

// Inicializa el array de partículas
function initParticles() {
    particles = [];
    // 🔢 DENSIDAD: Controla cuántas partículas hay en pantalla.
    // Fórmula: (Area de pantalla) / 18000.
    // -> Si bajas 18000 a 10000, habrá MÁS partículas.
    // -> Si subes 18000 a 30000, habrá MENOS partículas.
    const count = Math.floor((width * height) / 25000); 
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

// Dibuja el patrón de ajedrez del fondo
function drawPattern() {
    const tileSize = 60; // 📏 TAMAÑO CUADROS: 60px por cuadro
    const cols = Math.ceil(width / tileSize) + 1;
    const rows = Math.ceil(height / tileSize) + 1;

    // ⏱️ VELOCIDAD FONDO: El factor 0.02 controla la velocidad.
    // Sube a 0.05 para ir más rápido, baja a 0.01 para ir lento.
    const time = Date.now() * 0.02; 
    
    // Calcula el desplazamiento diagonal
    const offsetX = Math.floor(time % (tileSize * 2));
    const offsetY = Math.floor(time % (tileSize * 2));

    for (let i = -2; i < cols; i++) {
        for (let j = -2; j < rows; j++) {
            // Posición de cada celda
            const x = i * tileSize - offsetX;
            const y = j * tileSize + offsetY; 
            
            // Determina si es cuadro amarillo o azul (Patrón ajedrez)
            const isYellow = (i + j) % 2 === 0;

            if (isYellow) {
                // --- CUADRO AMARILLO ---
                ctx.fillStyle = colors.yellowBg;
                ctx.fillRect(x, y, tileSize, tileSize);
                
                // Rombo central
                ctx.fillStyle = colors.yellowDiamond;
                const pad = tileSize * 0.25; // Margen del rombo
                ctx.beginPath();
                ctx.moveTo(x + tileSize/2, y + pad); 
                ctx.lineTo(x + tileSize - pad, y + tileSize/2); 
                ctx.lineTo(x + tileSize/2, y + tileSize - pad); 
                ctx.lineTo(x + pad, y + tileSize/2); 
                ctx.closePath();
                ctx.fill();

            } else {
                // --- CUADRO AZUL ---
                ctx.fillStyle = colors.blueBg;
                ctx.fillRect(x, y, tileSize, tileSize);
                
                // Lunares (Dots)
                ctx.fillStyle = colors.blueDot;
                const dotSize = 3; // Tamaño de los puntitos
                const gap = tileSize / 3;
                
                // Dibuja 4 puntos por cuadro
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

// Bucle de animación principal
function animate() {
    ctx.clearRect(0, 0, width, height); // Limpiar pantalla

    // 1. Dibujar el fondo
    drawPattern();

    // 2. Dibujar las partículas flotantes
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate); // Repetir en el siguiente frame
}

// Escuchar cambios de tamaño de ventana
window.addEventListener('resize', resize);

// Iniciar
resize();
animate();