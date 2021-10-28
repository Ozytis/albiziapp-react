
using Hangfire;
using MailKit.Net.Smtp;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Authentication;
using System.Threading.Tasks;

namespace Common
{
    public static class MimeMessageExtensions
    {
        private static string hostName, userName, password;
        private static int port;
        private static bool isConfigured = false;

        public static void Configure(string hostName, int port, string userName, string password)
        {
            MimeMessageExtensions.hostName = hostName;
            MimeMessageExtensions.port = port;
            MimeMessageExtensions.userName = userName;
            MimeMessageExtensions.password = password;
            MimeMessageExtensions.isConfigured = true;
        }

        public static MimeMessage AddBody(this MimeMessage message, string text, string html)
        {
            var bodyBuilder = new BodyBuilder();

            if (!string.IsNullOrEmpty(text))
            {
                bodyBuilder.TextBody = text;
            }

            if (!string.IsNullOrEmpty(html))
            {
                bodyBuilder.HtmlBody = html;
            }

            message.Body = bodyBuilder.ToMessageBody();

            return message;

        }

        public static async Task SendWithSmtpAsync(this MimeMessage message, bool enqueue = false)
        {
            if (!MimeMessageExtensions.isConfigured)
            {
                throw new Exception("Veuillez configurer le serveur SMTP via la methode MimeMessageExtensions.Configure");
            }

            if (!enqueue)
            {
                using (var client = new SmtpClient())
                {
                    client.SslProtocols = SslProtocols.Ssl3 | SslProtocols.Ssl2 | SslProtocols.Tls | SslProtocols.Tls11 | SslProtocols.Tls12;
                    await client.ConnectAsync(hostName, port, false);
                    client.AuthenticationMechanisms.Remove("XOAUTH2");
                    await client.AuthenticateAsync(userName, password);

                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }
            }
            else
            {
                BackgroundJob.Enqueue(() => SendWithSmtpAsync(message, false));
            }
        }
    }
}
