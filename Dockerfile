FROM --platform=linux/amd64 node:18-alpine

# Crea el directorio de trabajo
WORKDIR /app

# Copia solo los archivos necesarios para instalar las dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia todo el código fuente
COPY . .

# Expone el puerto que tu aplicación utiliza en modo dev
EXPOSE 5173

# Comando para correr en modo desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
