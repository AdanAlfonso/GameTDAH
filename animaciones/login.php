<?php
session_start();

// Solo aceptamos POST desde el formulario
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html');
    exit;
}

// 1) Obtener datos del formulario
$usuario    = isset($_POST['usuario'])    ? trim($_POST['usuario'])    : '';
$contrasena = isset($_POST['contrasena']) ? trim($_POST['contrasena']) : '';

// 2) Validación básica de campos vacíos
if ($usuario === '' || $contrasena === '') {
    // Regresamos al login con un código de error (ya luego lo usas para mostrar mensaje)
    header('Location: index.html?error=campos_vacios');
    exit;
}

// (Opcional) cortar a 20 chars por seguridad, dado que en SQL es VARCHAR(20)
$usuario    = substr($usuario, 0, 20);
$contrasena = substr($contrasena, 0, 20);

// 3) Conexión a SQL Server (Azure)
// AJUSTA ESTOS DATOS A TU INSTANCIA
$serverName = "juegostdah.database.windows.net"; // ej: juegostdah.database.windows.net
$connectionOptions = [
    "Database" => "juegos", // ej: EmocionesDB
    "Uid"      => "jvz",   // ej: adminuser
    "PWD"      => "Nada0704",  // ej: tu contraseña
    "Encrypt"  => 1,
    "TrustServerCertificate" => 0,
    "LoginTimeout" => 30,
    "CharacterSet" => "UTF-8"
];

$conn = sqlsrv_connect($serverName, $connectionOptions);

if ($conn === false) {
    // En producción no es buena idea mostrar detalles, mejor log interno
    error_log("Error de conexión SQL Server: " . print_r(sqlsrv_errors(), true));
    header('Location: index.html?error=conexion_bd');
    exit;
}

// 4) Consultar en la tabla jugadores
//    Buscamos por el campo 'usuario'
$sql = "SELECT usuario, contrasena, nombre, edad, sexo 
        FROM jugadores
        WHERE usuario = ?";

$params = [$usuario];
$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt === false) {
    error_log("Error en consulta SQL: " . print_r(sqlsrv_errors(), true));
    header('Location: index.html?error=consulta_bd');
    exit;
}

// 5) Verificar si el usuario existe
$jugador = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

if (!$jugador) {
    // No existe ese usuario
    header('Location: index.html?error=usuario_invalido');
    exit;
}

// 6) Comparar contraseña
// En tu tabla 'jugadores' el campo es contrasena VARCHAR(20),
// aquí asumimos que está guardada en TEXTO PLANO.
// Luego puedes migrar a hash con password_hash.
if ($contrasena !== $jugador['contrasena']) {
    // Contraseña incorrecta
    header('Location: index.html?error=contrasena_incorrecta');
    exit;
}

// 7) Credenciales correctas → guardar datos en sesión
$_SESSION['usuario']  = $jugador['usuario'];
$_SESSION['nombre']   = $jugador['nombre'];
$_SESSION['edad']     = $jugador['edad'];
$_SESSION['sexo']     = $jugador['sexo'];
$_SESSION['autenticado'] = true;

// Limpieza
sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);

// 8) Redirigir al menú (ajusta la ruta si es necesario)
header('Location: ../estructuras/menu.html');
exit;