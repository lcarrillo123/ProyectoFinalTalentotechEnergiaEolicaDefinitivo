// Funciones de utilidad
function formatNumber(number) {
    return new Intl.NumberFormat('es-CO').format(number);
}

function validateFileType(file) {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
    const fileName = file.name.toLowerCase();
    return allowedTypes.includes(file.type) || fileName.endsWith('.csv');
}

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
});

// Funciones adicionales para la simulación
function addGlowEffect(element) {
    if (element) {
        element.style.filter = 'drop-shadow(0 0 10px #f1c40f)';
    }
}

function removeGlowEffect(element) {
    if (element) {
        element.style.filter = '';
    }
}

// Animación de partículas mejorada
function createAdvancedEnergyParticle() {
    if (!simulationRunning) return;

    const svg = document.querySelector('.simulation-svg');
    if (!svg) return;

    const particleContainer = document.getElementById('energy-particles');
    if (!particleContainer) return;

    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particle.setAttribute('r', '3');
    particle.setAttribute('fill', '#f1c40f');
    particle.setAttribute('cx', '130');
    particle.setAttribute('cy', '180');
    particle.classList.add('energy-particle');

    const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
    animateMotion.setAttribute('dur', '3s');
    animateMotion.setAttribute('repeatCount', '1');
    animateMotion.setAttribute('path', 'M0,0 Q120,20 250,-10 Q350,-20 450,-10 Q550,0 520,20');

    particle.appendChild(animateMotion);
    particleContainer.appendChild(particle);

    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 3000);
}

// Variables globales
let csvData = null;
let currentCharts = {};
let simulationRunning = false;
let simulationInterval = null;
let energyParticles = [];

// Datos de consumo energético nacional colombiano
const nationalData = {
    consumoPromedioPorPersona: 65, // kWh/mes por persona
    consumoPromedioHogar: 173, // kWh/mes promedio nacional
    costoPromedioKwh: 650, // COP promedio nacional
    participacionEolica: 0.1, // % actual de energía eólica
    potencialEolico: 28000, // MW de potencial eólico
    consumoNacionalAnual: 70000 // GWh anuales
};

// Datos técnicos detallados de componentes
const componentData = {
    blades: {
        title: "Aspas del Aerogenerador",
        description: "Las aspas capturan la energía cinética del viento y la convierten en energía rotacional mediante principios aerodinámicos avanzados.",
        function: "Las aspas están diseñadas con un perfil aerodinámico que genera sustentación cuando el viento las impacta. El ángulo de incidencia variable (pitch control) permite optimizar la captura de energía según la velocidad del viento.",
        specs: {
            "Material": "Fibra de vidrio reforzada con resina epoxi",
            "Longitud": "45-80 metros (según potencia)",
            "Peso": "6-12 toneladas cada una",
            "Velocidad rotación": "15-40 RPM",
            "Durabilidad": "20-25 años"
        },
        maintenance: "Inspección semestral, balanceado dinámico, verificación de sistemas de pitch control, revisión de estructuras y sellados."
    },
    nacelle: {
        title: "Góndola (Nacelle)",
        description: "Alberga todos los componentes principales del aerogenerador incluyendo el generador, multiplicadora y sistemas de control.",
        function: "La góndola contiene el generador que convierte la energía mecánica en eléctrica, la multiplicadora que aumenta las RPM, y todos los sistemas de control y monitoreo.",
        specs: {
            "Material": "Estructura de acero con carcasa de fibra de vidrio",
            "Peso": "50-80 toneladas",
            "Dimensiones": "15x4x4 metros aproximadamente",
            "Componentes": "Generador, multiplicadora, transformador",
            "Durabilidad": "20-25 años"
        },
        maintenance: "Mantenimiento preventivo trimestral, cambio de aceites, revisión de sistemas eléctricos, calibración de sensores."
    },
    hub: {
        title: "Buje Central (Hub)",
        description: "Conecta las aspas con el eje principal y permite la rotación controlada del sistema con el mecanismo de pitch control.",
        function: "El buje transmite la rotación de las aspas al eje principal y controla el ángulo de pitch de cada aspa para optimizar la eficiencia.",
        specs: {
            "Material": "Hierro fundido nodular GGG-40",
            "Diámetro": "3-4 metros",
            "Peso": "15-25 toneladas",
            "Conexiones": "3 aspas con rodamientos de pitch",
            "Durabilidad": "25-30 años"
        },
        maintenance: "Lubricación automática, inspección de rodamientos, calibración de actuadores de pitch, verificación de sensores."
    },
    tower: {
        title: "Torre de Soporte",
        description: "Estructura que eleva el aerogenerador a la altura óptima para capturar vientos de mayor velocidad y menor turbulencia.",
        function: "La torre eleva el rotor a alturas donde el viento es más fuerte y constante, soportando todas las cargas estáticas y dinámicas del aerogenerador.",
        specs: {
            "Material": "Acero S355 galvanizado en caliente",
            "Altura": "80-120 metros (según proyecto)",
            "Peso": "150-300 toneladas",
            "Diámetro base": "4-6 metros",
            "Durabilidad": "25-30 años"
        },
        maintenance: "Inspección visual anual, revisión de soldaduras, verificación de sistemas de protección, mantenimiento de escaleras y plataformas."
    },
    foundation: {
        title: "Cimentación",
        description: "Base de concreto armado que ancla firmemente el aerogenerador al suelo y transmite todas las cargas de forma segura al terreno.",
        function: "La cimentación distribuye uniformemente todas las cargas del aerogenerador al suelo, resistiendo fuerzas de compresión, tracción y momentos de volcamiento.",
        specs: {
            "Material": "Concreto armado f'c=28 MPa",
            "Profundidad": "3-5 metros bajo nivel del terreno",
            "Diámetro": "15-20 metros",
            "Peso": "500-1000 toneladas",
            "Durabilidad": "50+ años"
        },
        maintenance: "Inspección visual anual, verificación de drenajes, monitoreo de posibles asentamientos, revisión de pernos de anclaje."
    }
};

// Validaciones del formulario
const formValidations = {
    nombre: {
        required: true,
        minLength: 2,
        pattern: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/,
        errorMessage: "El nombre debe tener al menos 2 caracteres y solo contener letras"
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errorMessage: "Ingresa un correo electrónico válido"
    },
    telefono: {
        required: true,
        pattern: /^[\+]?[0-9\-\s\(\)]{7,15}$/,
        errorMessage: "Ingresa un número de teléfono válido (7-15 dígitos)"
    },
    empresa: {
        required: false,
        minLength: 2,
        errorMessage: "El nombre de la empresa debe tener al menos 2 caracteres"
    },
    asunto: {
        required: true,
        errorMessage: "Selecciona un asunto"
    },
    mensaje: {
        required: true,
        minLength: 10,
        maxLength: 500,
        errorMessage: "El mensaje debe tener entre 10 y 500 caracteres"
    },
    terminos: {
        required: true,
        errorMessage: "Debes aceptar los términos y condiciones"
    }
};

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando aplicación...');
    setupCalculator();
    setupFileUpload();
    setupSimulation();
    setupContactForm();
    console.log('Aplicación iniciada correctamente');
});

// Configuración de la calculadora de consumo energético
function setupCalculator() {
    const calcularBtn = document.getElementById('calcular-btn');
    const numPersonas = document.getElementById('num-personas');
    const consumoMensual = document.getElementById('consumo-mensual');
    const costoKwh = document.getElementById('costo-kwh');
    const resultsContent = document.getElementById('results-content');

    if (!calcularBtn || !numPersonas || !consumoMensual || !costoKwh || !resultsContent) {
        console.error('Error: No se encontraron todos los elementos de la calculadora');
        return;
    }

    calcularBtn.addEventListener('click', function() {
        const personas = parseInt(numPersonas.value);
        const consumo = parseFloat(consumoMensual.value);
        const costo = parseFloat(costoKwh.value);

        if (personas && consumo && costo) {
            calculateEnergyConsumption(personas, consumo, costo, resultsContent);
        } else {
            resultsContent.innerHTML = '<p style="color: #e74c3c; text-align: center; padding: 20px;">⚠️ Por favor, completa todos los campos con valores válidos.</p>';
        }
    });

    [numPersonas, consumoMensual, costoKwh].forEach(input => {
        input.addEventListener('input', function() {
            if (numPersonas.value && consumoMensual.value && costoKwh.value) {
                setTimeout(() => {
                    calcularBtn.click();
                }, 500);
            }
        });
    });

    setTimeout(() => {
        if (numPersonas.value && consumoMensual.value && costoKwh.value) {
            calcularBtn.click();
        }
    }, 100);
}

// Calcular consumo energético y comparaciones
function calculateEnergyConsumption(personas, consumoMensual, costoKwh, container) {
    const consumoAnual = consumoMensual * 12;
    const costoMensual = consumoMensual * costoKwh;
    const costoAnual = costoMensual * 12;
    const consumoPorPersona = consumoMensual / personas;

    const promedioNacional = nationalData.consumoPromedioHogar;
    const diferenciaNacional = ((consumoMensual - promedioNacional) / promedioNacional * 100);

    const promedioPersonaNacional = nationalData.consumoPromedioPorPersona;
    const diferenciaPersona = ((consumoPorPersona - promedioPersonaNacional) / promedioPersonaNacional * 100);

    const aerogeneradorCapacidad = 1.5;
    const factorCapacidad = 0.35;
    const generacionMensualAerogenerador = aerogeneradorCapacidad * 1000 * 24 * 30 * factorCapacidad;
    const aerogeneradoresNecesarios = Math.ceil(consumoMensual / generacionMensualAerogenerador * 100) / 100;

    const factorEmision = 0.164;
    const emisionesMensuales = consumoMensual * factorEmision;
    const emisionesAnuales = emisionesMensuales * 12;

    container.innerHTML = `
        <div class="results-grid">
            <div class="result-item">
                <h4>💡 Consumo Mensual</h4>
                <div class="result-value">${consumoMensual.toLocaleString('es-CO')} kWh</div>
                <small>Por persona: ${consumoPorPersona.toFixed(1)} kWh</small>
            </div>
            <div class="result-item">
                <h4>💰 Costo Mensual</h4>
                <div class="result-value">$${costoMensual.toLocaleString('es-CO')} COP</div>
                <small>Anual: $${costoAnual.toLocaleString('es-CO')} COP</small>
            </div>
            <div class="result-item">
                <h4>📊 vs Promedio Nacional</h4>
                <div class="result-value ${diferenciaNacional > 0 ? 'above' : 'below'}">
                    ${diferenciaNacional > 0 ? '+' : ''}${diferenciaNacional.toFixed(1)}%
                </div>
                <small>Promedio nacional: ${promedioNacional} kWh/mes</small>
            </div>
            <div class="result-item">
                <h4>👥 Per Cápita vs Nacional</h4>
                <div class="result-value ${diferenciaPersona > 0 ? 'above' : 'below'}">
                    ${diferenciaPersona > 0 ? '+' : ''}${diferenciaPersona.toFixed(1)}%
                </div>
                <small>Promedio: ${promedioPersonaNacional} kWh/persona</small>
            </div>
            <div class="result-item">
                <h4>🌪️ Equivalencia Eólica</h4>
                <div class="result-value">${aerogeneradoresNecesarios.toFixed(2)}</div>
                <small>Aerogeneradores necesarios mensualmente</small>
            </div>
            <div class="result-item">
                <h4>🌍 Impacto Ambiental</h4>
                <div class="result-value">${emisionesAnuales.toFixed(0)} kg CO₂/año</div>
                <small>Mensual: ${emisionesMensuales.toFixed(1)} kg CO₂</small>
            </div>
        </div>
        <div class="comparison-section">
            <h4>📈 Comparaciones Detalladas</h4>
            <div class="comparison-item">
                <span>Tu hogar vs promedio colombiano:</span>
                <strong>${diferenciaNacional > 0 ? 'Consumes ' + diferenciaNacional.toFixed(1) + '% más' : 'Consumes ' + Math.abs(diferenciaNacional).toFixed(1) + '% menos'}</strong>
            </div>
            <div class="comparison-item">
                <span>Ahorro potencial con energía eólica:</span>
                <strong>Hasta 30% en costos a largo plazo</strong>
            </div>
            <div class="comparison-item">
                <span>Contribución anual al sistema:</span>
                <strong>${(consumoAnual / 1000000 * 100).toFixed(4)}% del consumo nacional</strong>
            </div>
            <div class="comparison-item">
                <span>Reducción CO₂ con energía eólica:</span>
                <strong>${emisionesAnuales.toFixed(0)} kg CO₂/año evitados</strong>
            </div>
        </div>
    `;
}

// Configuración de carga de archivos CSV
function setupFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const selectFileBtn = document.getElementById('select-file-btn');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const processFileBtn = document.getElementById('process-file-btn');

    if (!uploadArea || !fileInput || !selectFileBtn) {
        console.error('Error: No se encontraron todos los elementos de carga de archivos');
        return;
    }

    selectFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.toLowerCase().endsWith('.csv')) {
            handleFileSelect(files[0]);
        } else {
            alert('Por favor, selecciona un archivo CSV válido.');
        }
    });

    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.name.toLowerCase().endsWith('.csv')) {
                handleFileSelect(file);
            } else {
                alert('Por favor, selecciona un archivo CSV válido.');
            }
        }
    });

    if (processFileBtn) {
        processFileBtn.addEventListener('click', function() {
            if (csvData && csvData.length > 0) {
                displayDataTable(csvData);
                setupChartGeneration(csvData);
            } else {
                alert('No hay datos CSV cargados para procesar.');
            }
        });
    }
}

// Manejar selección de archivo
function handleFileSelect(file) {
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');

    if (fileName) {
        fileName.textContent = file.name;
    }

    if (fileInfo) {
        fileInfo.style.display = 'block';
    }

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: function(results) {
            if (results.errors.length > 0) {
                console.error('Errores en el archivo CSV:', results.errors);
                alert('Se encontraron errores en el archivo CSV. Revisa la consola para más detalles.');
            }

            csvData = results.data;
            console.log('CSV cargado exitosamente:', csvData.length + ' filas');

            if (fileName) {
                fileName.textContent = file.name + ' ✓ (' + csvData.length + ' filas)';
                fileName.style.color = '#27ae60';
            }
        },
        error: function(error) {
            console.error('Error al leer el archivo CSV:', error);
            alert('Error al leer el archivo CSV: ' + error.message);
        }
    });
}

// Mostrar tabla de datos
function displayDataTable(data) {
    const tableContainer = document.getElementById('data-table-container');
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');

    if (!data || data.length === 0) {
        console.warn('No hay datos para mostrar en la tabla');
        return;
    }

    if (!tableContainer || !tableHeader || !tableBody) {
        console.error('No se encontraron los elementos de la tabla');
        return;
    }

    const columns = Object.keys(data[0]);

    tableHeader.innerHTML = columns.map(col => `<th>${col}</th>`).join('');

    const maxRows = Math.min(data.length, 100);
    tableBody.innerHTML = '';

    for (let i = 0; i < maxRows; i++) {
        const row = document.createElement('tr');
        row.innerHTML = columns.map(col => {
            const value = data[i][col];
            const displayValue = value !== null && value !== undefined ? value : '';
            return `<td>${displayValue}</td>`;
        }).join('');
        tableBody.appendChild(row);
    }

    tableContainer.style.display = 'block';

    let existingInfo = tableContainer.querySelector('.data-info');
    if (existingInfo) {
        existingInfo.remove();
    }

    const info = document.createElement('p');
    info.className = 'data-info';
    info.style.cssText = 'margin-bottom: 15px; padding: 10px; background: #e8f5e8; border-radius: 5px; color: #2d5a2d;';
    info.innerHTML = `<strong>📊 Datos cargados:</strong> ${data.length} filas, ${columns.length} columnas${data.length > 100 ? ' (mostrando primeras 100 filas)' : ''}`;
    tableContainer.insertBefore(info, tableContainer.firstChild);
}

// Configurar generación de gráficos
function setupChartGeneration(data) {
    const chartsContainer = document.getElementById('charts-container');
    const chartColumn = document.getElementById('chart-column');
    const generateChartsBtn = document.getElementById('generate-charts-btn');

    if (!data || data.length === 0) {
        console.warn('No hay datos para generar gráficos');
        return;
    }

    if (!chartsContainer || !chartColumn || !generateChartsBtn) {
        console.error('No se encontraron los elementos de gráficos');
        return;
    }

    const columns = Object.keys(data[0]);
    chartColumn.innerHTML = '<option value="">Selecciona una columna</option>';
    columns.forEach(col => {
        const option = document.createElement('option');
        option.value = col;
        option.textContent = col;
        chartColumn.appendChild(option);
    });

    chartsContainer.style.display = 'block';

    const newGenerateBtn = generateChartsBtn.cloneNode(true);
    generateChartsBtn.parentNode.replaceChild(newGenerateBtn, generateChartsBtn);

    newGenerateBtn.addEventListener('click', function() {
        const selectedColumn = chartColumn.value;
        if (selectedColumn) {
            generateCharts(data, selectedColumn);
        } else {
            alert('Por favor, selecciona una columna para graficar.');
        }
    });
}

// Generar gráficos
function generateCharts(data, columnName) {
    console.log('Generando gráficos para la columna:', columnName);

    Object.values(currentCharts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    currentCharts = {};

    const processedData = processDataForCharts(data, columnName);

    if (!processedData || processedData.labels.length === 0) {
        alert('No se pudieron procesar los datos para generar gráficos.');
        return;
    }

    try {
        generatePieChart(processedData, columnName);
        generateLineChart(processedData, columnName);
        generateBarChart(processedData, columnName);
        console.log('Gráficos generados exitosamente');
    } catch (error) {
        console.error('Error al generar gráficos:', error);
        alert('Error al generar los gráficos. Revisa la consola para más detalles.');
    }
}

// Procesar datos para gráficos
function processDataForCharts(data, columnName) {
    const columnData = data.map(row => row[columnName]).filter(val => val != null && val !== '');

    if (columnData.length === 0) {
        console.warn('No hay datos válidos en la columna:', columnName);
        return null;
    }

    const numericData = columnData.filter(val => typeof val === 'number' && !isNaN(val));

    if (numericData.length > columnData.length * 0.5) {
        const min = Math.min(...numericData);
        const max = Math.max(...numericData);

        if (min === max) {
            return {
                labels: [String(min)],
                values: [numericData.length],
                type: 'single_value'
            };
        }

        const ranges = Math.min(5, Math.ceil(numericData.length / 10));
        const rangeSize = (max - min) / ranges;

        const rangeCount = {};
        for (let i = 0; i < ranges; i++) {
            const rangeStart = min + (i * rangeSize);
            const rangeEnd = min + ((i + 1) * rangeSize);
            const label = `${rangeStart.toFixed(1)} - ${rangeEnd.toFixed(1)}`;
            rangeCount[label] = 0;
        }

        numericData.forEach(val => {
            const rangeIndex = Math.min(Math.floor((val - min) / rangeSize), ranges - 1);
            const rangeStart = min + (rangeIndex * rangeSize);
            const rangeEnd = min + ((rangeIndex + 1) * rangeSize);
            const label = `${rangeStart.toFixed(1)} - ${rangeEnd.toFixed(1)}`;
            rangeCount[label]++;
        });

        return {
            labels: Object.keys(rangeCount),
            values: Object.values(rangeCount),
            type: 'numeric'
        };
    } else {
        const frequency = {};
        columnData.forEach(val => {
            const key = String(val);
            frequency[key] = (frequency[key] || 0) + 1;
        });

        const sortedEntries = Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        return {
            labels: sortedEntries.map(([key]) => key),
            values: sortedEntries.map(([,value]) => value),
            type: 'categorical'
        };
    }
}

// Generar gráfico de torta
function generatePieChart(processedData, columnName) {
    const ctx = document.getElementById('pie-chart');
    if (!ctx) {
        console.error('No se encontró el canvas para el gráfico de torta');
        return;
    }

    const chartCtx = ctx.getContext('2d');

    currentCharts.pie = new Chart(chartCtx, {
        type: 'pie',
        data: {
            labels: processedData.labels,
            datasets: [{
                data: processedData.values,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Distribución de ${columnName}`,
                    font: { size: 14, weight: 'bold' }
                },
                legend: {
                    position: 'bottom',
                    labels: { 
                        padding: 15, 
                        usePointStyle: true,
                        maxWidth: 150
                    }
                }
            }
        }
    });
}

// Generar gráfico de líneas
function generateLineChart(processedData, columnName) {
    const ctx = document.getElementById('line-chart');
    if (!ctx) {
        console.error('No se encontró el canvas para el gráfico de líneas');
        return;
    }

    const chartCtx = ctx.getContext('2d');

    currentCharts.line = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: processedData.labels,
            datasets: [{
                label: columnName,
                data: processedData.values,
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#36A2EB',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Tendencia de ${columnName}`,
                    font: { size: 14, weight: 'bold' }
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.1)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// Generar gráfico de barras
function generateBarChart(processedData, columnName) {
    const ctx = document.getElementById('bar-chart');
    if (!ctx) {
        console.error('No se encontró el canvas para el gráfico de barras');
        return;
    }

    const chartCtx = ctx.getContext('2d');

    currentCharts.bar = new Chart(chartCtx, {
        type: 'bar',
        data: {
            labels: processedData.labels,
            datasets: [{
                label: `Frecuencia de ${columnName}`,
                data: processedData.values,
                backgroundColor: processedData.labels.map((_, i) => 
                    `hsl(${(i * 137.508) % 360}, 70%, 60%)`
                ),
                borderColor: processedData.labels.map((_, i) => 
                    `hsl(${(i * 137.508) % 360}, 70%, 50%)`
                ),
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Frecuencia de ${columnName}`,
                    font: { size: 14, weight: 'bold' }
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.1)' },
                    ticks: { stepSize: 1 }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            }
        }
    });
}

// Configurar simulación interactiva
function setupSimulation() {
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const clickableParts = document.querySelectorAll('.clickable-part');
    const infoDisplay = document.getElementById('component-info-display');

    if (!playBtn || !pauseBtn || !stopBtn) {
        console.error('No se encontraron los botones de control de simulación');
        return;
    }

    playBtn.addEventListener('click', startSimulation);
    pauseBtn.addEventListener('click', pauseSimulation);
    stopBtn.addEventListener('click', stopSimulation);

    clickableParts.forEach(part => {
        part.addEventListener('click', function() {
            clickableParts.forEach(p => p.classList.remove('active'));
            this.classList.add('active');

            const partType = this.getAttribute('data-part');
            displayComponentInfo(partType, infoDisplay);
        });

        part.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.opacity = '0.8';
            }
        });

        part.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
    });

    console.log('Simulación configurada correctamente');
}

function startSimulation() {
    if (simulationRunning) return;

    simulationRunning = true;
    updateSimulationStatus('Funcionando', '1500 kW', 'Con energía');

    const blades = document.getElementById('blades');
    if (blades) {
        blades.classList.remove('stopped', 'paused');
        blades.classList.add('blades-rotating');
    }

    const powerLines = document.querySelectorAll('.power-line');
    powerLines.forEach(line => {
        line.classList.remove('stopped');
    });

    const houseLights = document.querySelectorAll('.house-light');
    houseLights.forEach(light => {
        light.classList.add('active');
    });

    simulationInterval = setInterval(createAdvancedEnergyParticle, 800);

    console.log('Simulación iniciada');
}

function pauseSimulation() {
    if (!simulationRunning) return;

    updateSimulationStatus('Pausado', '0 kW', 'Energía limitada');

    const blades = document.getElementById('blades');
    if (blades) {
        blades.classList.add('paused');
    }

    const powerLines = document.querySelectorAll('.power-line');
    powerLines.forEach(line => {
        line.style.animationPlayState = 'paused';
    });

    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }

    console.log('Simulación pausada');
}

function stopSimulation() {
    simulationRunning = false;
    updateSimulationStatus('Detenido', '0 kW', 'Sin energía');

    const blades = document.getElementById('blades');
    if (blades) {
        blades.classList.remove('blades-rotating', 'paused');
        blades.classList.add('stopped');
    }

    const powerLines = document.querySelectorAll('.power-line');
    powerLines.forEach(line => {
        line.classList.add('stopped');
        line.style.animationPlayState = 'running';
    });

    const houseLights = document.querySelectorAll('.house-light');
    houseLights.forEach(light => {
        light.classList.remove('active');
    });

    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }

    const particleContainer = document.getElementById('energy-particles');
    if (particleContainer) {
        particleContainer.innerHTML = '';
    }

    console.log('Simulación detenida');
}

function updateSimulationStatus(wind, generation, house) {
    const windStatus = document.getElementById('wind-status');
    const generationStatus = document.getElementById('generation-status');
    const houseStatus = document.getElementById('house-status');

    if (windStatus) windStatus.textContent = wind;
    if (generationStatus) generationStatus.textContent = generation;
    if (houseStatus) houseStatus.textContent = house;
}

function displayComponentInfo(partType, container) {
    const data = componentData[partType];

    if (!data) {
        container.innerHTML = '<div class="info-placeholder"><p>🔍 Información no disponible para este componente</p></div>';
        return;
    }

    container.innerHTML = `
        <div class="component-detail active">
            <h3>${data.title}</h3>
            <p><strong>Descripción:</strong> ${data.description}</p>
            
            <div class="detail-grid">
                <div class="detail-section">
                    <h4>⚙️ Funcionamiento</h4>
                    <p>${data.function}</p>
                    
                    <h4>🔧 Mantenimiento</h4>
                    <p>${data.maintenance}</p>
                </div>
                
                <div class="detail-section">
                    <h4>📋 Especificaciones Técnicas</h4>
                    <ul>
                        ${Object.entries(data.specs).map(([key, value]) => 
                            `<li><strong>${key}:</strong> ${value}</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Configurar formulario de contacto
function setupContactForm() {
    const form = document.getElementById('contact-form');
    const fields = ['nombre', 'email', 'telefono', 'empresa', 'asunto', 'mensaje', 'terminos'];
    let validationStates = {};

    if (!form) {
        console.error('No se encontró el formulario de contacto');
        return;
    }

    fields.forEach((fieldName, index) => {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}-error`);
        const successElement = document.getElementById(`${fieldName}-success`);

        if (!field) return;

        validationStates[fieldName] = false;

        if (index > 0) {
            field.disabled = true;
        }

        if (field.type === 'checkbox') {
            field.addEventListener('change', () => validateField(fieldName, fields, validationStates));
        } else {
            field.addEventListener('input', () => validateField(fieldName, fields, validationStates));
            field.addEventListener('blur', () => validateField(fieldName, fields, validationStates));
        }
    });

    form.addEventListener('submit', handleFormSubmit);

    console.log('Formulario de contacto configurado');
}

function validateField(fieldName, fields, validationStates) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`);
    const successElement = document.getElementById(`${fieldName}-success`);
    const validation = formValidations[fieldName];

    if (!field || !validation) return;

    let isValid = true;
    let errorMessage = '';

    const value = field.type === 'checkbox' ? field.checked : field.value.trim();

    if (validation.required && !value) {
        isValid = false;
        errorMessage = field.type === 'checkbox' ? validation.errorMessage : 'Este campo es obligatorio';
    }

    if (isValid && validation.minLength && typeof value === 'string' && value.length < validation.minLength) {
        isValid = false;
        errorMessage = `Debe tener al menos ${validation.minLength} caracteres`;
    }

    if (isValid && validation.maxLength && typeof value === 'string' && value.length > validation.maxLength) {
        isValid = false;
        errorMessage = `No debe exceder ${validation.maxLength} caracteres`;
    }

    if (isValid && validation.pattern && typeof value === 'string' && !validation.pattern.test(value) && value !== '') {
        isValid = false;
        errorMessage = validation.errorMessage;
    }

    if (errorElement) {
        errorElement.textContent = errorMessage;
    }

    if (successElement) {
        if (isValid && value) {
            successElement.classList.add('show');
            field.classList.add('valid');
            field.classList.remove('invalid');
        } else {
            successElement.classList.remove('show');
            field.classList.remove('valid');
            if (!isValid && value) {
                field.classList.add('invalid');
            } else {
                field.classList.remove('invalid');
            }
        }
    }

    validationStates[fieldName] = isValid && (value || !validation.required);

    const currentIndex = fields.indexOf(fieldName);
    if (currentIndex >= 0 && currentIndex < fields.length - 1) {
        const nextField = document.getElementById(fields[currentIndex + 1]);
        if (nextField && validationStates[fieldName]) {
            nextField.disabled = false;
        } else if (nextField && !validationStates[fieldName]) {
            nextField.disabled = true;
            for (let i = currentIndex + 1; i < fields.length; i++) {
                const laterField = document.getElementById(fields[i]);
                if (laterField) {
                    laterField.disabled = true;
                    laterField.value = laterField.type === 'checkbox' ? false : '';
                    laterField.classList.remove('valid', 'invalid');
                    const laterSuccess = document.getElementById(`${fields[i]}-success`);
                    if (laterSuccess) laterSuccess.classList.remove('show');
                    validationStates[fields[i]] = false;
                }
            }
        }
    }

    const submitButton = document.getElementById('enviar-btn');
    if (submitButton) {
        const allRequiredValid = fields.every(fieldName => {
            const validation = formValidations[fieldName];
            return !validation.required || validationStates[fieldName];
        });

        submitButton.disabled = !allRequiredValid;
    }
}

function handleFormSubmit(e) {
    e.preventDefault();

    const progressBar = document.getElementById('progress-bar');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const successMessage = document.getElementById('success-message');
    const form = e.target;

    progressBar.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Enviando...';

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15 + 5;

        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);

            setTimeout(() => {
                progressBar.style.display = 'none';
                successMessage.style.display = 'block';

                setTimeout(() => {
                    resetForm(form);
                    successMessage.style.display = 'none';
                }, 3000);
            }, 500);
        }

        progressFill.style.width = progress + '%';

        if (progress < 30) {
            progressText.textContent = 'Validando información...';
        } else if (progress < 70) {
            progressText.textContent = 'Procesando datos...';
        } else if (progress < 95) {
            progressText.textContent = 'Enviando mensaje...';
        } else {
            progressText.textContent = '¡Completado!';
        }

    }, 200);
}

function resetForm(form) {
    form.reset();

    const fields = ['nombre', 'email', 'telefono', 'empresa', 'asunto', 'mensaje', 'terminos'];
    fields.forEach((fieldName, index) => {
        const field = document.getElementById(fieldName);
        const successElement = document.getElementById(`${fieldName}-success`);
        const errorElement = document.getElementById(`${fieldName}-error`);

        if (field) {
            field.disabled = index > 0;
            field.classList.remove('valid', 'invalid');
        }

        if (successElement) {
            successElement.classList.remove('show');
        }

        if (errorElement) {
            errorElement.textContent = '';
        }
    });

    const submitButton = document.getElementById('enviar-btn');
    if (submitButton) {
        submitButton.disabled = true;
    }

    console.log('Formulario reseteado');
}