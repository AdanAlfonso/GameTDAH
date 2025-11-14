<?php
// login.php
// Este archivo únicamente prueba la conexión a SQL Server (Azure).
// No valida usuarios todavía.

session_start();

// Si entra por GET, redirige al formulario original:
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html');
    exit;
}

// Obtener datos del formulario (sin usarlos por ahora)
$usuario    = isset($_POST['usuario'])    ? trim($_POST['usuario'])    : '';
$contrasena = isset($_POST['contrasena']) ? $_POST['contrasena']       : '';

// ===============================
// CONFIGURACIÓN SQL SERVER AZURE
// ===============================

// SOLO modifica estos valores:
$serverName = "tcp:juegostdah.database.windows.net,1433"; // ejemplo: tcp:midb.database.windows.net,1433
$connectionOptions = [
    "Database" => "juegos",   // ejemplo: "EmocionesDB"
    "Uid"      => "jvz",     // ejemplo: "adminuser"
    "PWD"      => "Nada0704",    // ejemplo: "Password123!"
    "Encrypt"  => 1,
    "TrustServerCertificate" => 0,
    "CharacterSet" => "UTF-8"
];

// Intentar conexión
$conn = sqlsrv_connect($serverName, $connectionOptions);

// ===============================
// RESPUESTA DE PRUEBA
// ===============================
if ($conn) {
    echo "<h2 style='color: #00ff99; font-family: Arial;'>✔ Conexión exitosa a SQL Server Azure</h2>";
    echo "<p style='color:white;'>Servidor: $serverName</p>";
    echo "<p style='color:white;'>Base de datos: {$connectionOptions['Database']}</p>";
    
    echo "<br><a href='index.html' style='color:#7b5cff;'>Volver al login</a>";

} else {
    echo "<h2 style='color: #ff4444; font-family: Arial;'>✘ Error al conectar a SQL Server Azure</h2>";
    echo "<pre style='color:white;'>";
    print_r(sqlsrv_errors());
    echo "</pre>";

    echo "<br><a href='index.html' style='color:#7b5cff;'>Volver al login</a>";
}

?>
