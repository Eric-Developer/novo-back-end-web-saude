function generateWebSaudeEmailHtml(content: string): string {
    return `
  <!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #F2E7DC;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #038C7F;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 24px;
            margin: 0;
        }
        .content {
            padding: 20px;
            text-align: center;
            color: #333;
            font-size: 16px;
            line-height: 1.5;
        }
        .footer {
            background-color: #F2E7DC;
            padding: 10px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #038C7F;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        .btn:hover {
            background-color: #026E65;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>WEB SAÚDE</h1>
        </div>
        <div class="content">
            <p>Olá!</p>
            <p>Para concluir seu cadastro no Web Saúde, clique no botão abaixo para verificar seu e-mail:</p>
            <a href="${content}" class="btn">Verificar E-mail</a>
            <p style="margin-top: 20px;">Caso não tenha solicitado o cadastro, ignore este e-mail.</p>
        </div>
        <div class="footer">
            <p>Se você não solicitou este e-mail, ignore-o com segurança.</p>
        </div>
    </div>
</body>
</html>
    `;
}

export { generateWebSaudeEmailHtml };
