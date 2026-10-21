// SPDX-License-Identifier: GPL-3.0-only
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;
using System.Windows.Forms;

internal sealed class GameLauncher : Form
{
    private readonly string folder = AppDomain.CurrentDomain.BaseDirectory;
    private readonly Label status = new Label();
    private readonly Label hint = new Label();
    private readonly Button open = new Button();
    private readonly Button stop = new Button();
    private readonly Timer monitor = new Timer();
    private readonly StringBuilder errors = new StringBuilder();
    private Process owned;
    private IntPtr job;
    private string url, version;
    private bool closing;

    [STAThread]
    private static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new GameLauncher());
    }

    public GameLauncher()
    {
        Text = "Pokemon Survivors";
        ClientSize = new Size(570, 254);
        Font = new Font("Segoe UI", 10);
        AutoScaleMode = AutoScaleMode.Dpi;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Color.FromArgb(245, 248, 242);
        var title = new Label { Text = "Pokemon Survivors", Font = new Font("Segoe UI", 20, FontStyle.Bold), AutoSize = true, Location = new Point(24, 20) };
        status.SetBounds(26, 75, 520, 42);
        status.Text = "Starting your game...";
        hint.SetBounds(26, 122, 520, 55);
        hint.Text = "The game opens in your browser. Save & return to camp before\nclosing this window. English / Deutsch is available in the game.";
        open.Text = "Open game";
        open.SetBounds(26, 194, 155, 36);
        open.Enabled = false;
        open.Click += delegate { OpenBrowser(); };
        stop.Text = "Stop game";
        stop.SetBounds(195, 194, 155, 36);
        stop.Click += delegate { Close(); };
        Controls.AddRange(new Control[] { title, status, hint, open, stop });
        Shown += async delegate { await StartGame(); };
        FormClosing += delegate { closing = true; StopOwned(); };
        monitor.Interval = 1000;
        monitor.Tick += delegate {
            if (!closing && owned != null && owned.HasExited)
                Fail("The local game server stopped. Close this window and start again.");
        };
    }

    private async Task StartGame()
    {
        try
        {
            int port = 4173;
            string configured = Environment.GetEnvironmentVariable("PORT");
            if (!String.IsNullOrEmpty(configured) && (!Int32.TryParse(configured, out port) || port < 1024 || port > 65535))
                throw new InvalidOperationException("The PORT setting must be between 1024 and 65535.");
            url = "http://127.0.0.1:" + port;
            string runtime = Path.Combine(folder, "runtime", "node.exe");
            string server = Path.Combine(folder, "server.mjs");
            if (!File.Exists(runtime) || !File.Exists(server) || !File.Exists(Path.Combine(folder, "dist", "index.html")))
                throw new InvalidOperationException("Files are missing. Extract the entire Windows ZIP, then start the game from the extracted folder.");
            var info = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(File.ReadAllText(Path.Combine(folder, "dist", "build-info.json")));
            if (!info.ContainsKey("assetsComplete") || !Object.Equals(info["assetsComplete"], true))
                throw new InvalidOperationException("Game media are missing. Extract the complete Windows player download.");
            version = Convert.ToString(info["version"]);
            string running = await Task.Run(() => Probe());
            if (closing) return;
            if (running != null)
            {
                if (running != version)
                    throw new InvalidOperationException("Another game version is running. Close its launch window first. Your browser saves will remain.");
                Ready(false);
                return;
            }
            var start = new ProcessStartInfo(runtime, "\"" + server + "\"") {
                WorkingDirectory = folder, UseShellExecute = false, CreateNoWindow = true,
                RedirectStandardError = true, RedirectStandardOutput = true
            };
            start.EnvironmentVariables["PORT"] = port.ToString();
            start.EnvironmentVariables.Remove("NODE_OPTIONS");
            start.EnvironmentVariables.Remove("NODE_PATH");
            start.EnvironmentVariables.Remove("NODE_EXTRA_CA_CERTS");
            job = Native.CreateKillOnCloseJob();
            owned = new Process { StartInfo = start };
            owned.ErrorDataReceived += delegate(object sender, DataReceivedEventArgs e) {
                if (e.Data != null) lock(errors) { if(errors.Length < 3000) errors.AppendLine(e.Data); }
            };
            owned.OutputDataReceived += delegate { };
            owned.Start();
            if (!Native.AssignProcessToJobObject(job, owned.Handle))
                throw new InvalidOperationException("Windows could not attach the game to this launcher. Please restart the game.");
            owned.BeginErrorReadLine();
            owned.BeginOutputReadLine();
            for (int i = 0; i < 40; i++)
            {
                if (closing) return;
                if (owned.HasExited)
                {
                    string detail;
                    lock(errors) detail = errors.ToString().Trim();
                    throw new InvalidOperationException(detail.Length > 0 ? detail : "The game could not start. Check whether another application uses port " + port + ".");
                }
                string health = await Task.Run(() => Probe());
                if (closing) return;
                if (health == version && !owned.HasExited) { Ready(true); return; }
                await Task.Delay(200);
            }
            throw new InvalidOperationException("Startup took too long. Close this window and try again.");
        }
        catch (Exception e) { if (!closing) Fail(e.Message); }
    }

    private string Probe()
    {
        try
        {
            var request = (HttpWebRequest)WebRequest.Create(url + "/__game_health");
            request.Proxy = null;
            request.Timeout = 700;
            request.ReadWriteTimeout = 700;
            request.AllowAutoRedirect = false;
            using (var response = request.GetResponse())
            using (var reader = new StreamReader(response.GetResponseStream()))
            {
                var buffer = new char[4097];
                int length = reader.ReadBlock(buffer, 0, buffer.Length);
                if (length > 4096) return null;
                var data = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(new string(buffer, 0, length));
                if (Convert.ToString(data["app"]) != "pokemon-survivors-local") return null;
                return Convert.ToString(data["version"]);
            }
        }
        catch { return null; }
    }

    private void Ready(bool ownsServer)
    {
        status.Text = ownsServer ? "Your game is running locally.\n" + url : "The game is already running.\n" + url;
        status.ForeColor = Color.FromArgb(32, 100, 64);
        open.Enabled = true;
        if (ownsServer) monitor.Start();
        else
        {
            stop.Text = "Close window";
            hint.Text = "The original launch window controls the game.\nClosing this extra window will leave it running.";
        }
        OpenBrowser();
    }

    private void OpenBrowser()
    {
        if (Environment.GetEnvironmentVariable("POKEMON_NO_BROWSER") == "1") return;
        try { Process.Start(new ProcessStartInfo(url) { UseShellExecute = true }); }
        catch { hint.Text = "Your browser could not open automatically.\nOpen " + url + " in Edge or Chrome."; }
    }

    private void Fail(string message)
    {
        monitor.Stop();
        StopOwned();
        status.Text = "The game could not start.";
        status.ForeColor = Color.FromArgb(160, 45, 40);
        hint.Text = message;
        hint.Height = 66;
        open.Enabled = false;
        stop.Text = "Close window";
        // The complete error is also available through the standard accessible description.
        hint.AccessibleDescription = message;
    }

    private void StopOwned()
    {
        monitor.Stop();
        if (owned != null)
        {
            try { if (!owned.HasExited) { owned.Kill(); owned.WaitForExit(2000); } } catch { }
            owned.Dispose();
            owned = null;
        }
        if (job != IntPtr.Zero) { Native.CloseHandle(job); job = IntPtr.Zero; }
    }
}

internal static class Native
{
    [StructLayout(LayoutKind.Sequential)]
    private struct BasicLimits {
        public long PerProcessUserTimeLimit, PerJobUserTimeLimit;
        public uint LimitFlags;
        public UIntPtr MinimumWorkingSetSize, MaximumWorkingSetSize;
        public uint ActiveProcessLimit;
        public UIntPtr Affinity;
        public uint PriorityClass, SchedulingClass;
    }
    [StructLayout(LayoutKind.Sequential)]
    private struct IoCounters { public ulong ReadOperationCount, WriteOperationCount, OtherOperationCount, ReadTransferCount, WriteTransferCount, OtherTransferCount; }
    [StructLayout(LayoutKind.Sequential)]
    private struct ExtendedLimits {
        public BasicLimits BasicLimitInformation;
        public IoCounters IoInfo;
        public UIntPtr ProcessMemoryLimit, JobMemoryLimit, PeakProcessMemoryUsed, PeakJobMemoryUsed;
    }
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr CreateJobObject(IntPtr attributes, string name);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool SetInformationJobObject(IntPtr job, int infoClass, ref ExtendedLimits info, uint length);
    [DllImport("kernel32.dll", SetLastError = true)]
    internal static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
    [DllImport("kernel32.dll")]
    internal static extern bool CloseHandle(IntPtr handle);
    internal static IntPtr CreateKillOnCloseJob()
    {
        IntPtr handle = CreateJobObject(IntPtr.Zero, null);
        if (handle == IntPtr.Zero) throw new InvalidOperationException("Windows could not create the game process group.");
        var limits = new ExtendedLimits();
        limits.BasicLimitInformation.LimitFlags = 0x2000; // JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
        if (!SetInformationJobObject(handle, 9, ref limits, (uint)Marshal.SizeOf(limits)))
        {
            CloseHandle(handle);
            throw new InvalidOperationException("Windows could not configure automatic game shutdown.");
        }
        return handle;
    }
}
