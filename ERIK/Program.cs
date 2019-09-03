using Discord;
using Discord.WebSocket;
using ERIK.Helpers;
using System;
using System.Threading.Tasks;

namespace ERIK
{
    class Program
    {
        protected DiscordSocketClient _client;

        internal static void Main(string[] args)
            => new Program().MainAsync().GetAwaiter().GetResult();

        internal async Task MainAsync()
        {
            _client = new DiscordSocketClient();

            _client.Log += Logger.Log;

            string DiscordToken = Properties.Settings.Default.DiscordToken;

            await Logger.Log("Started client with token  " + DiscordToken);

            await _client.LoginAsync(TokenType.Bot, DiscordToken);
            await _client.StartAsync();

            //Events
            _client.MessageReceived += MessageReceived;

            await Task.Delay(-1);
        }

        private async Task MessageReceived(SocketMessage message)
        {
            if (message.Content == "!ping")
            {
                await message.Channel.SendMessageAsync("Pong!");
            }
        }


    }
}
