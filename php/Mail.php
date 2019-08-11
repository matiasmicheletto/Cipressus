<?php
header('Access-Control-Allow-Origin: *');
setlocale(LC_ALL,"es_AR");

require("PHPMailer.php");
require("SMTP.php");

$nombre = $_POST['name'];
$email = $_POST['email'];
$cc = explode(",", $_POST['cc']);
$asunto = $_POST['subject'];
$msg = $_POST['message'];
$body =  '<html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="user-scalable=no, initial-scale=1, width=device-width, height=device-height" /> 
          </head> 
          <body>' . $msg . ' </body></html>';

$mail = new PHPMailer();
$mail->IsSMTP();
$mail->Port = 25;                                     // Puerto SMTP
$mail->SMTPAuth = true;                               // Habilitar autenticacion SMTP
$mail->Host = "smtp.uns.edu.ar";                      // SMTP a utilizar. 
$mail->Username = "";                                 // Correo completo a utilizar
$mail->Password = "";                                 // Contraseña
$mail->SMTPSecure = "tls";                            // Habilitar encriptacion
$mail->CharSet = 'UTF-8';
$mail->From = "noreply@cipressus.uns.edu.ar";         // Desde donde se envia
$mail->FromName = "Cipressus";
$mail->IsHTML(true);                                  // El correo se envía como HTML
$mail->Subject = $asunto;                             // Titulo del email
$mail->addAddress($email);                            // Destinatarios

foreach($cc as $emails) {
  $mail->AddBCC($emails);
}

$mail->Body    = $body;
$mail->AltBody = "Tu cliente de correo soporta lectura HTML"; 

if(!$mail->Send()) {
  echo "Mailer Error: " . $mail->ErrorInfo;
  exit;
}

?>
