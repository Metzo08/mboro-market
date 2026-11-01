$urls = Select-String -Path backend\prisma\seed\seed.ts,frontend\src\lib\images.ts -Pattern 'https://images\.unsplash\.com/[a-z0-9-]+' -AllMatches | ForEach-Object { $_.Matches.Value } | Sort-Object -Unique
Write-Output ("total: " + $urls.Count)
$bad = @()
foreach ($u in $urls) {
  $full = $u + "?w=600&q=80"
  try {
    $r = Invoke-WebRequest -Uri $full -Method Head -UseBasicParsing -TimeoutSec 15 -UserAgent "Mozilla/5.0"
    Write-Output ($r.StatusCode + " " + $u)
  } catch {
    Write-Output ("ERR " + $u + " :: " + $_.Exception.Message)
    $bad += $u
  }
}
Write-Output ("BAD COUNT: " + $bad.Count)
$bad | Set-Content -Path bad-images.txt
