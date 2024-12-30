import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
console.log(process.env.EMAIL, process.env.SENHA_EMAIL)
const siteUrl = 'URL';

function createTransporter(): Transporter {
    const email = process.env.EMAIL;
    const senhaEmail = process.env.SENHA_EMAIL;
    if (!email || !senhaEmail) {
        throw new Error("As variáveis de ambiente EMAIL ou SENHA_EMAIL não estão definidas.");
    }

    return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: email,
            pass: senhaEmail,
            
        }
    });
}

// Função renomeada para enviar o e-mail de verificação de cadastro
async function sendAccountVerificationEmail(email: string, token: string): Promise<void> {
    console.log('Token de verificação:', token);
    const transporter = createTransporter();
    const verificationUrl = `${siteUrl}/auth/verify?token=${token}&email=${email}`;

    const emailContent = `
        Olá!
        
        Para concluir seu cadastro no Web Saúde, clique no link abaixo para verificar seu e-mail:
        ${verificationUrl}
        
        Caso não tenha solicitado o cadastro, ignore este e-mail.
    `;

    const mailOptions: SendMailOptions = {
        from: `Web Saúde <${process.env.EMAIL}>`,
        to: email,
        subject: 'Verificação de E-mail',
        text: emailContent
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de verificação enviado com sucesso para: ${email}`);
    } catch (error) {
        console.error("Erro ao enviar e-mail de verificação:", error);
        throw error;
    }
}

// Função renomeada para enviar o e-mail de recuperação de senha
async function sendPasswordRecoveryEmail(email: string, resetToken: string): Promise<void> {
    const transporter = createTransporter();
    const resetUrl = `${siteUrl}/auth/reset-password?token=${resetToken}&email=${email}`;

    const emailContent = `
        Olá!
        
        Para redefinir sua senha no Web Saúde, clique no link abaixo:
        ${resetUrl}
        
        Caso não tenha solicitado a recuperação de senha, ignore este e-mail.
    `;

    const mailOptions: SendMailOptions = {
        from: `Web Saúde <${process.env.EMAIL}>`,
        to: email,
        subject: 'Recuperação de Senha',
        text: emailContent
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de recuperação de senha enviado com sucesso para: ${email}`);
    } catch (error) {
        console.error("Erro ao enviar e-mail de recuperação de senha:", error);
        throw error;
    }
}

// Função renomeada para enviar o e-mail de finalização de cadastro
async function sendFinalizationEmail(email: string, token: string): Promise<void> {
    const transporter = createTransporter();
    const url = `${siteUrl}/rota?token=${token}&email=${email}`;

    const emailContent = `
        Olá!
        
        Sua solicitação de cadastro foi aprovada. Para finalizar o cadastro do seu estabelecimento, clique no link abaixo:
        ${url}
        
        Caso não tenha solicitado o cadastro, ignore este e-mail.
    `;

    const mailOptions: SendMailOptions = {
        from: `Web Saúde <${process.env.EMAIL}>`,
        to: email,
        subject: 'Finalização de Cadastro',
        text: emailContent
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de finalização de cadastro enviado com sucesso para: ${email}`);
    } catch (error) {
        console.error("Erro ao enviar e-mail de finalização de cadastro:", error);
        throw error;
    }
}

export { sendAccountVerificationEmail, sendPasswordRecoveryEmail, sendFinalizationEmail };
