$path = "C:\Users\HP\Downloads\mboro-market\Cahier_des_charges_JendCiThies_SenECarte.pdf"
$bytes = [System.IO.File]::ReadAllBytes($path)
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$text | Out-File -FilePath "C:\Users\HP\Downloads\mboro-market\pdf_extract.txt" -Encoding UTF8
Write-Host "Bytes read: $($bytes.Length)"
Write-Host "Text written"
if (Test-Path "C:\Users\HP\Downloads\mboro-market\pdf_extract.txt") {
    Get-ChildItem "C:\Users\HP\Downloads\mboro-market\pdf_extract.txt"
}
