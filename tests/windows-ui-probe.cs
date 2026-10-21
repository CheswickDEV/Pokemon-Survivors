// SPDX-License-Identifier: GPL-3.0-only
// Test helper: inspect or close only a process explicitly launched by the smoke test.
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Text;
using System.Web.Script.Serialization;
internal static class WindowsUiProbe {
    private delegate bool Callback(IntPtr hwnd, IntPtr state);
    [DllImport("user32.dll")] private static extern bool EnumWindows(Callback cb, IntPtr state);
    [DllImport("user32.dll")] private static extern bool EnumChildWindows(IntPtr parent, Callback cb, IntPtr state);
    [DllImport("user32.dll")] private static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
    [DllImport("user32.dll",CharSet=CharSet.Unicode)] private static extern int GetWindowText(IntPtr hwnd, StringBuilder text, int max);
    [DllImport("user32.dll")] private static extern bool ShowWindow(IntPtr hwnd,int command);
    [DllImport("user32.dll")] private static extern bool IsWindowVisible(IntPtr hwnd);
    [DllImport("user32.dll")] private static extern IntPtr SendMessage(IntPtr hwnd,uint msg,IntPtr w,IntPtr l);
    [DllImport("user32.dll")] private static extern bool GetWindowRect(IntPtr hwnd,out Rect rect);
    [DllImport("user32.dll")] private static extern bool PrintWindow(IntPtr hwnd,IntPtr hdc,uint flags);
    [StructLayout(LayoutKind.Sequential)] private struct Rect { public int Left,Top,Right,Bottom; }
    private static string Text(IntPtr hwnd) {var text=new StringBuilder(4096);GetWindowText(hwnd,text,text.Capacity);return text.ToString();}
    private static int Main(string[] args) {
        uint pid=UInt32.Parse(args[1]);IntPtr window=IntPtr.Zero;
        EnumWindows(delegate(IntPtr h,IntPtr state){uint id;GetWindowThreadProcessId(h,out id);if(id==pid&&Text(h)=="Pokemon Survivors"){window=h;return false;}return true;},IntPtr.Zero);
        if(window==IntPtr.Zero){Console.WriteLine("{}");return 0;}
        if(args[0]=="close"){SendMessage(window,0x0010,IntPtr.Zero,IntPtr.Zero);return 0;}
        var texts=new List<string>();
        EnumChildWindows(window,delegate(IntPtr h,IntPtr s){texts.Add(Text(h));return true;},IntPtr.Zero);
        if(args[0]=="capture"){
            ShowWindow(window,5);System.Threading.Thread.Sleep(250);
            Rect rect;GetWindowRect(window,out rect);
            using(var bitmap=new Bitmap(rect.Right-rect.Left,rect.Bottom-rect.Top))
            using(var graphics=Graphics.FromImage(bitmap)){
                IntPtr hdc=graphics.GetHdc();try{if(!PrintWindow(window,hdc,2))throw new Exception("Window capture failed.");}finally{graphics.ReleaseHdc(hdc);}
                bitmap.Save(args[2],ImageFormat.Png);
            }
        }
        Console.WriteLine(new JavaScriptSerializer().Serialize(new {visible=IsWindowVisible(window),title=Text(window),texts=texts}));
        return 0;
    }
}
