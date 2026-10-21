// SPDX-License-Identifier: GPL-3.0-only
import {mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
export async function buildLauncher(root) {
  if (process.platform !== 'win32') throw Error('The GUI launcher must be compiled on Windows.');
  const compiler = path.join(process.env.SystemRoot || 'C:\\Windows', 'Microsoft.NET/Framework64/v4.0.30319/csc.exe');
  const directory = path.join(root, '.cache/launcher');
  await mkdir(directory, {recursive:true});
  const output = path.join(directory, 'Pokemon Survivors.exe');
  const result = spawnSync(compiler, ['/nologo', '/target:winexe', '/platform:x64', '/optimize+', '/debug-', '/utf8output', '/reference:System.Windows.Forms.dll', '/reference:System.Drawing.dll', '/reference:System.Web.Extensions.dll', '/out:'+output, path.join(root,'platform/windows/Launcher.cs')], {cwd:root,encoding:'utf8',windowsHide:true});
  if (result.error || result.status !== 0) throw Error('Windows .NET Framework launcher compilation failed: '+(result.error?.message || result.stdout+' '+result.stderr));
  return output;
}
