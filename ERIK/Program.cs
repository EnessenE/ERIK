using Discord;
using Discord.Commands;
using Discord.WebSocket;
using ERIK.Handlers;
using ERIK.Helpers;
using System.Threading.Tasks;

namespace ERIK
{
    class Program
    {
        protected DiscordSocketClient _client;
        protected CommandService commandService;
        protected CommandHandler commandHandler;

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

            commandService = new CommandService();
            commandHandler = new CommandHandler(_client, commandService);

            await commandHandler.InstallCommandsAsync();


            //Events

            await Task.Delay(-1);
        }
    }
}
