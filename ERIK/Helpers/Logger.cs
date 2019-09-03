using Discord;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERIK.Helpers
{
    static class Logger
    {
        internal static Task Log(LogMessage msg)
        {
            return Log(msg.ToString());
        }

        internal static Task Log(String msg)
        {
            Console.WriteLine(msg.ToString());
            return Task.CompletedTask;
        }
    }
}
