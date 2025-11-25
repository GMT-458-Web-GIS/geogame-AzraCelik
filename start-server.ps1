# Basit HTTP Sunucusu - PowerShell Script
$port = 8000
$url = "http://localhost:$port/"

Write-Host "HTTP Sunucusu başlatılıyor..." -ForegroundColor Green
Write-Host "Tarayıcınızda şu adresi açın: $url" -ForegroundColor Yellow
Write-Host "Durdurmak için Ctrl+C tuşlarına basın" -ForegroundColor Gray
Write-Host ""

# Basit HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()

Write-Host "Sunucu çalışıyor! $url" -ForegroundColor Green

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") {
            $localPath = "/index.html"
        }
        
        $filePath = Join-Path $PSScriptRoot $localPath.TrimStart('/')
        
        if (Test-Path $filePath) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $extension = [System.IO.Path]::GetExtension($filePath)
            
            # MIME type belirleme
            $contentType = switch ($extension) {
                ".html" { "text/html; charset=utf-8" }
                ".js" { "application/javascript; charset=utf-8" }
                ".css" { "text/css; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png" { "image/png" }
                ".jpg" { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif" { "image/gif" }
                ".svg" { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 - Dosya bulunamadı")
            $response.ContentLength64 = $notFound.Length
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
        
        $response.Close()
    }
} finally {
    $listener.Stop()
    Write-Host "`nSunucu durduruldu." -ForegroundColor Red
}

