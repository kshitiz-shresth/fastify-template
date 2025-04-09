import nodemailer from "nodemailer";
import mailgunTransport from "nodemailer-mailgun-transport";
import { readFileSync } from "fs";
import path from "path";
import hbs from "handlebars"; // Template engine for email rendering

// Email templates and partials directories
const templatesDir = path.join(__dirname, "..", "email", "templates");
const partialsDir = path.join(__dirname, "..", "email", "partials");

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = this.setupTransporter();
    this.registerPartials();
  }

  // Configure transporter based on environment
  private setupTransporter(): nodemailer.Transporter {
    if (process.env.NODE_ENV !== "production") {
      return nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: parseInt(process.env.MAILTRAP_PORT || "587"),
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS,
        },
      });
    }

    return nodemailer.createTransport(
      mailgunTransport({
        auth: {
          api_key: process.env.MAILGUN_API_KEY || "",
          domain: process.env.MAILGUN_DOMAIN,
        },
      })
    );
  }

  // Register Handlebars partials
  private registerPartials(): void {
    const partialFiles = ["header.hbs", "footer.hbs"];
    partialFiles.forEach((file) => {
      const partialPath = path.join(partialsDir, file);
      const partialName = path.basename(file, ".hbs");
      const partialContent = readFileSync(partialPath, "utf-8");
      hbs.registerPartial(partialName, partialContent);
    });
  }

  // Render email from template
  private renderTemplate(templateName: string, data: object): string {
    const templatePath = path.join(templatesDir, `${templateName}.hbs`);
    const template = readFileSync(templatePath, "utf-8");
    const compiledTemplate = hbs.compile(template);
    return compiledTemplate(data);
  }

  // Send email
  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    data: object
  ): Promise<void> {
    const html = this.renderTemplate(templateName, data);

    const mailOptions = {
      from: "no-reply@mytemplate.us",
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Email could not be sent");
    }
  }
}

export const emailService = new EmailService();
