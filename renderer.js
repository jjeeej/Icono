const { Client } = require('minecraft-launcher-core');
const fs = require('fs');

const firebase = require('firebase/app');
require('firebase/database');

const Launcher = new Client();
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTngrCrRfjgrTK3ujm1L799cfcjawE9h8",
  authDomain: "minecraftlauncher-23cbd.firebaseapp.com",
  databaseURL: "https://minecraftlauncher-23cbd-default-rtdb.firebaseio.com",
  projectId: "minecraftlauncher-23cbd",
  storageBucket: "minecraftlauncher-23cbd.firebasestorage.app",
  messagingSenderId: "744198646535",
};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app);


// Define la ruta en tu base de datos donde está la configuración del lanzador
// Esto debe coincidir exactamente con el nodo que creaste en la consola ('launcherConfig')
const launcherConfigPath = '/LauncherConfig';

// --- Parte 2: Referencias a elementos del DOM ---

// Obtén referencias a los elementos HTML una sola vez
const runFileButton = document.getElementById('launch');
const nickInput = document.getElementById("nick");
const statusElement = document.getElementById("status");
const fondoElement = document.getElementById("fondo");
const downloadScreenElement = document.getElementById("download-screen");
const descargaElement = document.getElementById("descarga");

// --- Parte 3: Listeners del Lanzador ---

// Define los listeners del Lanzador.on() una vez.
Launcher.on('debug', (e) => console.log(e));

Launcher.on('data', (e) => {
  console.log(e);
  statusElement.textContent = e; // Muestra el estado en el elemento 'status'
  fondoElement.style.display = "none"; // Oculta fondos/pantallas de descarga cuando hay data del lanzador
  downloadScreenElement.style.display = "none";
});

Launcher.on('download', (e) => {
  // Muestra fondos/pantallas de descarga cuando hay información de descarga
  fondoElement.style.display = "block";
  downloadScreenElement.style.display = "block";
  descargaElement.textContent = e; // Muestra el progreso de descarga
});

Launcher.on("close", () => {
  // Limpia el estado y habilita los inputs cuando el lanzador se cierra
  runFileButton.classList.remove("activo");
  nickInput.disabled = false;
  statusElement.textContent = "Jugando"; // O algún otro mensaje
  fondoElement.style.display = "none"; // Asegura que los fondos estén ocultos al cerrar
  downloadScreenElement.style.display = "none";
});


runFileButton.addEventListener('click', async () => {
  const nickValue = nickInput.value;
  nickInput.disabled = true;
  runFileButton.classList.add("activo");
  statusElement.textContent = "Cargando configuración...";

  let opt;
  try {
    // Lee los datos de Firebase usando await
    const snapshot = await database.ref(launcherConfigPath).once('value');

    if (snapshot.exists()) {
      const configData = snapshot.val();
      console.log("Configuración cargada desde Firebase:", configData);

      opt = {
        detached: false,
        clientPackage: configData.clientPackage,
        root: configData.root,
        version: configData.version,
        memory: configData.memory,
        timeout: 10000,
        authorization: {
          access_token: '',
          client_token: '',
          uuid: '',
          name: nickValue,
          user_properties: '{}',
          meta: {
              type: 'mojang' || 'msa',
              demo: false,
              xuid: '',
              clientId: ''
          }
        },
      };

    } else {
      console.log("No se encontró configuración en Firebase en la ruta:", launcherConfigPath, ". Usando configuración por defecto.");
      opt = {
        root: null,
        clientPackage: null,
        version: { number: null, type: null, custom: null},
        memory: { max: null, min: null }
      };
      statusElement.textContent = "Error no se puede iniciar la instancia";
    }
    console.log("Iniciando:", opt);
    Launcher.launch(opt);
    statusElement.textContent = "Iniciando launcher...";

  } catch (error) {
    console.error("Error al cargar la configuración o al lanzar:", error);
    statusElement.textContent = `Error: ${error.message || error}`;
    nickInput.disabled = false;
    runFileButton.classList.remove("activo");
  }
      launch.on('estimated', (time) => {
        let hours = Math.floor(time / 3600);
        let minutes = Math.floor((time - hours * 3600) / 60);
        let seconds = Math.floor(time - hours * 3600 - minutes * 60);
        vuxiLogger.info(`${hours}h ${minutes}m ${seconds}s`);
    })
});


// renderer.js

// ... (Tu código existente, incluyendo imports, inicialización de Firebase,
//      referencias a elementos del DOM como runFileButton, nickInput, statusElement,
//      fondoElement, downloadScreenElement, descargaElement, y los listeners del Launcher) ...

// --- Parte 3.5: Más Referencias a elementos del DOM para actualizar ---

// Obtén referencias a los elementos específicos dentro de las secciones que quieres modificar
const downloadTitleElement = downloadScreenElement.querySelector('.download-title'); // El div con el título "TEST"
const timeTextElement = downloadScreenElement.querySelector('#time-text');           // El div con el texto del tiempo estimado
const downloadIconImgElement = downloadScreenElement.querySelector('.download-icon img'); // La imagen del icono de descarga
const textElement = document.querySelector('.mensaje');
const logoElement = document.querySelector('.center .logo'); // El div que contiene los spans del logo

// Opcional: Si quieres actualizar el texto "Downloading..." (¡Ojo! ver explicación abajo)
// const statusTextDynamicPart = downloadScreenElement.querySelector('#status-text');


// --- Parte 4: Listener de Firebase para Configuración de UI (Tiempo Real) ---

// Define la ruta en tu base de datos donde está la configuración de UI
const uiConfigPath = '/uiConfig'; // Usaremos esta ruta

// Obtiene una referencia a la ubicación de la configuración de UI en la base de datos
const uiConfigRef = database.ref(uiConfigPath);

// Escucha cambios en tiempo real en esa ubicación
// Esta función se ejecutará la primera vez que te conectes y cada vez que los datos en /uiConfig cambien
uiConfigRef.on('value', (snapshot) => {
  const uiConfigData = snapshot.val(); // Obtiene los datos de la configuración de UI

  console.log("Datos de Configuración de UI (Tiempo Real):", uiConfigData);

  // Verifica si hay datos y actualiza los elementos HTML
  if (uiConfigData) {

    // Actualizar la pantalla de descarga
    if (downloadTitleElement && uiConfigData.downloadScreen && uiConfigData.downloadScreen.title) {
      downloadTitleElement.textContent = uiConfigData.downloadScreen.title;
    }

    // Ojo: status-text contiene #descarga (que actualiza el launcher) y el spinner.
    // No vamos a sobreescribir todo el status-text aquí para no romper lo del launcher.
    // Si quieres un texto fijo *antes* de lo que pone el launcher, podrías añadir otro elemento.
    // Por ahora, solo actualizaremos el título y el tiempo estimado.

    if (timeTextElement && uiConfigData.downloadScreen && uiConfigData.downloadScreen.timeLeftText) {
      timeTextElement.textContent = uiConfigData.downloadScreen.timeLeftText;
    }

    // Actualizar la imagen del icono de descarga
    if (downloadIconImgElement && uiConfigData.downloadScreen && uiConfigData.downloadScreen.iconUrl) {
        // Asegúrate de que la URL en Firebase sea accesible (puede ser de Storage o una URL pública)
        downloadIconImgElement.src = uiConfigData.downloadScreen.iconUrl;
    } else if (downloadIconImgElement) {
        // Si no hay URL en Firebase, podrías poner  una por defecto o dejar la del HTML
        // downloadIconImgElement.src = "../windows/image.png"; // O dejar la del HTML
    }

        if (textElement && uiConfigData.centerSection && uiConfigData.centerSection.text) {
      // Recreamos el contenido HTML del logo con los textos de Firebase
      textElement.innerHTML = `<p>${uiConfigData.centerSection.text}</p>`;
    } else if (textElement) {
       // Si no hay datos en Firebase, podrías restaurar el logo por defecto del HTML
       textElement.innerHTML = ``;
    }
    // Actualizar la sección central (el logo)
    // Asumimos que el logo tiene dos partes en los spans
    if (logoElement && uiConfigData.centerSection && uiConfigData.centerSection.logoTextPart1 && uiConfigData.centerSection.logoTextPart2) {
      // Recreamos el contenido HTML del logo con los textos de Firebase
      logoElement.innerHTML = `<span>${uiConfigData.centerSection.logoTextPart1}</span> <span>${uiConfigData.centerSection.logoTextPart2}</span>`;
    } else if (logoElement) {
       // Si no hay datos en Firebase, podrías restaurar el logo por defecto del HTML
       logoElement.innerHTML = `<span></span> <span></span>`;
    }

    // ... puedes agregar más actualizaciones de elementos aquí según tu estructura de datos ...

  } else {
    // Si no hay datos en /uiConfig, puedes poner valores por defecto o vaciar elementos
    console.log("No se encontró configuración de UI en /uiConfig. Usando valores por defecto o vacíos.");
     if (downloadTitleElement) downloadTitleElement.textContent = "TEST"; // Restaurar el texto original o por defecto
     if (timeTextElement) timeTextElement.textContent = "puede tardar hasta 5:00 (depende de su computadora)";
     if (downloadIconImgElement) downloadIconImgElement.src = "../windows/image.png";
     if (logoElement) logoElement.innerHTML = `<span>EUFONIA</span> <span>STUDIO.</span>`;
     // if (statusTextDynamicPart) statusTextDynamicPart.textContent = "Downloading..."; // ¡Ojo con esto! Podría romper lo del launcher.
  }

}, (error) => {
  // Maneja cualquier error al leer de la base de datos
  console.error("Error al leer Configuración de UI:", error);
  // Opcional: Mostrar un mensaje de error en alguna parte de la UI, como el statusElement
  if (statusElement) {
      statusElement.textContent = `Error al cargar UI config: ${error.message}`;
  }
});

const bodyStylesPath = 'styles/body'; // Sin la barra al inicio, también funciona

// Obtiene una referencia a la ubicación de los estilos del body
const bodyStylesRef = database.ref(bodyStylesPath);

// Escucha cambios en tiempo real en esa ubicación
// Esta función se ejecutará la primera vez que te conectes y cada vez que los datos en "styles/body" cambien
bodyStylesRef.on('value', (snapshot) => {
  const stylesData = snapshot.val(); // Obtiene los datos de los estilos como un objeto JavaScript

  console.log("Datos de Estilos del Body (Tiempo Real):", stylesData);

  // Verifica si hay datos y aplica los estilos al elemento body
  if (stylesData) {
    const bodyElement = document.body; // Accede al elemento body

    // Aplica cada estilo encontrado en los datos al elemento body
    // Usamos un bucle para recorrer todas las propiedades recibidas
    // Asegúrate de que las propiedades en Firebase estén en camelCase (backgroundColor, etc.)
    for (const styleProperty in stylesData) {
      // Opcional: verificar si la propiedad existe en el objeto style para evitar errores extraños
      if (bodyElement.style.hasOwnProperty(styleProperty)) {
         bodyElement.style[styleProperty] = stylesData[styleProperty];
      } else {
         console.warn(`Propiedad de estilo "${styleProperty}" de Firebase no reconocida o no aplicable directamente al body.`);
      }
    }

    console.log("Estilos del body actualizados desde Firebase Realtime Database.");

  } else {
    // Si no hay datos en la ruta de estilos del body, puedes poner estilos por defecto
    console.log("No se encontraron datos de estilos para el body en Firebase Realtime Database en la ruta:", bodyStylesPath);
    // Opcional: Aquí podrías revertir a estilos CSS por defecto o a un conjunto de estilos predeterminado en JS
    // Por ejemplo:
    // const bodyElement = document.body;
    // bodyElement.style.backgroundColor = '#f0f0f0';
    // bodyElement.style.backgroundImage = 'none';
    // ... restablecer otras propiedades ...
  }

}, (error) => {
  // Maneja cualquier error al leer de la base de datos
  console.error("Error al leer Estilos del Body de Firebase:", error);
  // Opcional: Mostrar un mensaje de error en alguna parte de la UI
  if (statusElement) {
      statusElement.textContent = `Error al cargar estilos del body: ${error.message}`;
  }
});
// --- Parte 5: Listener de Firebase para Estilos del Elemento .mensaje (Tiempo Real) ---

// Define la ruta en tu base de datos donde estarán los estilos del elemento .mensaje
const mensajeStylesPath = 'styles/mensaje'; // Un lugar lógico siguiendo tu patrón

// Obtiene una referencia a la ubicación de los estilos del elemento .mensaje
const mensajeStylesRef = database.ref(mensajeStylesPath);

// Escucha cambios en tiempo real en esa ubicación
mensajeStylesRef.on('value', (snapshot) => {
  const stylesData = snapshot.val(); // Obtiene los datos de los estilos como un objeto JavaScript

  console.log("Datos de Estilos del Elemento .mensaje (Tiempo Real):", stylesData);

  // Verifica si hay datos y aplica los estilos al elemento textElement
  // (Ya tienes textElement definido: const textElement = document.querySelector('.mensaje');)
  if (textElement && stylesData) { // Asegúrate de que textElement exista y haya datos

    // textElement ya es una referencia al elemento, no necesitas 'as HTMLElement' en JS puro
    // const htmlElement = textElement as HTMLElement; // <--- ¡Eliminamos esta línea!

    // Aplica cada estilo encontrado en los datos al elemento textElement directamente
    for (const styleProperty in stylesData) {
        try {
             // Convertimos la primera letra a minúscula si no lo está (por si acaso)
            const jsStyleProperty = styleProperty.charAt(0).toLowerCase() + styleProperty.slice(1);

             // Aplicamos el estilo directamente a textElement.style
             // Añadido comprobación explícita para los 3 estilos comunes, aunque el check general también sirve
            if (textElement.style.hasOwnProperty(jsStyleProperty) || ['fontSize', 'color', 'textAlign'].includes(jsStyleProperty) ) {
                 textElement.style[jsStyleProperty] = stylesData[styleProperty];
            } else {
                 console.warn(`Propiedad de estilo "${styleProperty}" de Firebase no reconocida o no aplicable directamente a .mensaje.`);
            }

        } catch (e) {
            console.error(`Error aplicando estilo "${styleProperty}":`, e);
        }
    }

    console.log("Estilos del elemento .mensaje actualizados desde Firebase Realtime Database.");

  } else {
    // Si no hay datos en la ruta de estilos, puedes poner estilos por defecto (los de tu CSS original)
    console.log("No se encontraron datos de estilos para .mensaje en Firebase Realtime Database en la ruta:", mensajeStylesPath);
     if (textElement) {
        textElement.style.fontSize = '0.8rem';
        textElement.style.color = 'white';
        textElement.style.textAlign = 'center';
        console.log("Aplicados estilos por defecto para .mensaje.");
     }
  }

}, (error) => {
  console.error("Error al leer Estilos de .mensaje de Firebase:", error);
  if (statusElement) {
      statusElement.textContent = `Error al cargar estilos de .mensaje: ${error.message}`;
  }
});

// ... (El resto de tu código, como el event listener del botón 'launch') ...
