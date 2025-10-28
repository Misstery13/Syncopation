// Simulación de base de datos de usuarios usando localStorage
class AuthService {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'syncopation_users';
        this.tempSaveKey = 'temp_game_progress';
    }

    // Inicializar usuarios en localStorage si no existen
    init() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    // Obtener todos los usuarios
    getUsers() {
        const usersJson = localStorage.getItem(this.storageKey);
        return usersJson ? JSON.parse(usersJson) : [];
    }

    // Guardar usuarios
    saveUsers(users) {
        localStorage.setItem(this.storageKey, JSON.stringify(users));
    }

    // Registrar nuevo usuario
    register(username, password) {
        const users = this.getUsers();
        
        // Verificar si el usuario ya existe
        if (users.find(u => u.username === username)) {
            return {
                success: false,
                message: 'El usuario ya existe'
            };
        }

        // Crear nuevo usuario
        const newUser = {
            username,
            password: this.hashPassword(password), // En producción usar bcrypt
            progress: {
                level: 1,
                score: 0,
                lastSaved: new Date().toISOString()
            },
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);

        return {
            success: true,
            message: 'Cuenta creada exitosamente'
        };
    }

    // Autenticar usuario
    login(username, password) {
        const users = this.getUsers();
        const user = users.find(u => u.username === username);

        if (!user) {
            return {
                success: false,
                message: 'Usuario no encontrado'
            };
        }

        if (user.password !== this.hashPassword(password)) {
            return {
                success: false,
                message: 'Contraseña incorrecta'
            };
        }

        // Usuario autenticado
        this.currentUser = user;
        sessionStorage.setItem('currentUser', username);

        return {
            success: true,
            message: 'Sesión iniciada',
            user: user
        };
    }

    // Usuario invitado
    loginAsGuest() {
        this.currentUser = {
            username: 'guest',
            isGuest: true
        };
        sessionStorage.setItem('currentUser', 'guest');
        
        return {
            success: true,
            message: 'Jugando como invitado',
            user: this.currentUser
        };
    }

    // Guardar progreso del juego
    saveProgress(gameData) {
        if (this.currentUser && !this.currentUser.isGuest) {
            // Guardado permanente para usuarios registrados
            const users = this.getUsers();
            const userIndex = users.findIndex(u => u.username === this.currentUser.username);
            
            if (userIndex !== -1) {
                users[userIndex].progress = {
                    ...gameData,
                    lastSaved: new Date().toISOString()
                };
                this.saveUsers(users);
                return {
                    success: true,
                    type: 'permanent',
                    message: 'Progreso guardado permanentemente'
                };
            }
        } else {
            // Guardado temporal para invitados
            localStorage.setItem(this.tempSaveKey, JSON.stringify(gameData));
            return {
                success: true,
                type: 'temporary',
                message: 'Progreso guardado temporalmente'
            };
        }
    }

    // Cargar progreso guardado
    loadProgress() {
        if (this.currentUser && !this.currentUser.isGuest) {
            // Cargar progreso permanente
            const users = this.getUsers();
            const user = users.find(u => u.username === this.currentUser.username);
            
            if (user && user.progress) {
                return {
                    success: true,
                    data: user.progress,
                    type: 'permanent'
                };
            }
        } else {
            // Cargar progreso temporal
            const tempProgress = localStorage.getItem(this.tempSaveKey);
            if (tempProgress) {
                return {
                    success: true,
                    data: JSON.parse(tempProgress),
                    type: 'temporary'
                };
            }
        }
        
        return {
            success: false,
            message: 'No hay progreso guardado'
        };
    }

    // Cerrar sesión
    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
    }

    // Verificar si hay sesión activa
    isAuthenticated() {
        const username = sessionStorage.getItem('currentUser');
        if (!username) return false;

        if (username === 'guest') {
            return true;
        }

        const users = this.getUsers();
        const user = users.find(u => u.username === username);
        return user !== undefined;
    }

    // Obtener usuario actual
    getCurrentUser() {
        const username = sessionStorage.getItem('currentUser');
        if (!username) return null;

        if (username === 'guest') {
            return { username: 'guest', isGuest: true };
        }

        const users = this.getUsers();
        return users.find(u => u.username === username);
    }

    // Hash simple de contraseña (en producción usar bcrypt)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }
}

export default AuthService;