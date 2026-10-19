Add-Type -AssemblyName System.Text.Encoding

$path = "C:\Users\HP\Downloads\mboro-market\Cahier_des_charges_JendCiThies_SenECarte.pdf"
$bytes = [System.IO.File]::ReadAllBytes($path)

# Lire le PDF en binaire brut
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Extraire les streams compressés (FlateDecode)
$lines = $content -split "`n"
$streams = @()
$inStream = $false
$currentStream = ""

foreach ($line in $lines) {
    if ($line -match 'stream') {
        $inStream = $true
        $currentStream = ""
        continue
    }
    if ($inStream -and $line -match 'endstream') {
        $inStream = $false
        if ($currentStream -ne "") {
            $streams += $currentStream.Trim()
        }
        continue
    }
    if ($inStream -and $currentStream -ne "") {
        $currentStream += $line + "`n"
    }
}

Write-Host ("Nb streams extraits: $($streams.Count)")

# Essayer de décompresser les streams avec zlib
$decodedContent = ""
foreach ($stream in $streams) {
    try {
        # Convertir en bytes et décompresser
        $byteArray = [System.Text.Encoding]::ASCII.GetBytes($stream)
        $ms = New-Object System.IO.MemoryStream
        $ms.Write($byteArray, 0, $byteArray.Length)
        $ms.Position = 0
        
        $zipStream = New-Object System.IO.Compression.DeflateStream($ms, [System.IO.Compression.CompressionMode]::Decompress)
        $reader = New-Object System.IO.StreamReader($zipStream)
        $content = $reader.ReadToEnd()
        
        if ($content -match '[a-zA-Z]') {
            $decodedContent += $content
            Write-Host "Décompressé OK"
        } else {
            Write-Host "Stream texte pur (pas de décompression nécessaire)"
            $decodedContent += $content
        }
    } catch {
        Write-Host ("Erreur: $_")
    }
}

# Afficher le contenu
if ($decodedContent -ne "") {
    Write-Host "=== Contenu extrait ==="
    $lines = $decodedContent -split "`n"
    $lines | Where-Object { $_ -match '[a-zA-Z]' } | Select-Object -First 100 | ForEach-Object {
        Write-Host $_
    }
}





