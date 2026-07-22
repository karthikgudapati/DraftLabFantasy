# Draft Lab local server — http://localhost:8843/
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8843
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root on http://localhost:$port/"
$mime = @{ ".html"="text/html"; ".js"="application/javascript"; ".css"="text/css"; ".json"="application/json"; ".png"="image/png" }
while ($listener.IsListening) {
  $ctx = $listener.GetContext(); $req = $ctx.Request; $res = $ctx.Response
  try {
    $rel = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrEmpty($rel)) { $rel = "index.html" }
    $fp = Join-Path $root $rel
    if (Test-Path $fp -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($fp)
      $res.ContentType = if ($mime[$ext]) { $mime[$ext] } else { "application/octet-stream" }
      $b = [System.IO.File]::ReadAllBytes($fp); $res.ContentLength64 = $b.Length; $res.OutputStream.Write($b, 0, $b.Length)
    } else { $res.StatusCode = 404 }
  } catch { $res.StatusCode = 500 } finally { $res.OutputStream.Close() }
}
