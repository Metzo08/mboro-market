try {
  $r = Invoke-WebRequest -Uri 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80' -Method Head -UseBasicParsing -TimeoutSec 15 -UserAgent 'Mozilla/5.0'
  Write-Output $r.StatusCode
} catch {
  Write-Output ('ERR: ' + $_.Exception.Message)
}
