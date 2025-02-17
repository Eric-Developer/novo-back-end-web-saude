import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { generateWebSaudeEmailHtml } from './layoutEmail';

const siteUrl = 'https://websaude.netlify.app';

function createTransporter(): Transporter {
  const email = process.env.EMAIL;
  const senhaEmail = process.env.SENHA_EMAIL;
  if (!email || !senhaEmail) {
    throw new Error(
      'As variáveis de ambiente EMAIL ou SENHA_EMAIL não estão definidas.'
    );
  }

  return nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: email,
      pass: senhaEmail,
    },
  });
}

// Função para enviar o e-mail de verificação de cadastro
async function sendAccountVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  console.log('Token de verificação:', token);
  const transporter = createTransporter();
  const verificationUrl = `${siteUrl}/auth/verify?token=${token}&email=${email}`;
  const emailContent =
    'Para concluir seu cadastro no Web Saúde, clique no botão abaixo para verificar seu e-mail:';

  const mailOptions: SendMailOptions = {
    from: `Web Saúde <${process.env.EMAIL}>`,
    to: email,
    subject: 'Verificação de E-mail',
    html: generateWebSaudeEmailHtml(verificationUrl, emailContent),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`E-mail de verificação enviado com sucesso para: ${email}`);
  } catch (error) {
    console.error('Erro ao enviar e-mail de verificação:', error);
    throw error;
  }
}

// Função para enviar o e-mail de recuperação de senha
async function sendPasswordRecoveryEmail(
  email: string,
  resetToken: string
): Promise<void> {
  const transporter = createTransporter();
  const resetUrl = `${siteUrl}/auth/reset-password?token=${resetToken}&email=${email}`;
  const emailContent =
    'Para redefinir sua senha no Web Saúde, clique no link abaixo:';

  const mailOptions: SendMailOptions = {
    from: `Web Saúde <${process.env.EMAIL}>`,
    to: email,
    subject: 'Recuperação de Senha',
    html: generateWebSaudeEmailHtml(resetUrl, emailContent),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `E-mail de recuperação de senha enviado com sucesso para: ${email}`
    );
  } catch (error) {
    console.error('Erro ao enviar e-mail de recuperação de senha:', error);
    throw error;
  }
}

// Função para enviar o e-mail de finalização de cadastro
async function sendFinalizationEmail(
  email: string,
  token: string
): Promise<void> {
  const transporter = createTransporter();
  const url = `${siteUrl}/rota?token=${token}&email=${email}`;
  const emailContent =
    'Sua solicitação de cadastro foi aprovada. Para finalizar o cadastro do seu estabelecimento, clique no link abaixo:';

  const mailOptions: SendMailOptions = {
    from: `Web Saúde <${process.env.EMAIL}>`,
    to: email,
    subject: 'Finalização de Cadastro',
    html: generateWebSaudeEmailHtml(url, emailContent),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `E-mail de finalização de cadastro enviado com sucesso para: ${email}`
    );
  } catch (error) {
    console.error('Erro ao enviar e-mail de finalização de cadastro:', error);
    throw error;
  }
}

export {
  sendAccountVerificationEmail,
  sendPasswordRecoveryEmail,
  sendFinalizationEmail,
};
