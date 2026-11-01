Add-Type -AssemblyName System.Drawing

function New-PwaIcon {
    param([int]$size, [string]$path)

    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.TextRenderingHint = 'AntiAlias'

    # Fond teal #115E59
    $g.Clear([System.Drawing.Color]::FromArgb(17, 94, 89))

    # Disque terracotta central
    $tealBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(232, 99, 44))
    $cx = $size / 2.0
    $cy = $size / 2.0
    $radius = $size * 0.38
    $g.FillEllipse($tealBrush, ($cx - $radius), ($cy - $radius), ($radius * 2), ($radius * 2))

    # Texte "Jë" en blanc au centre
    $fontSize = $size * 0.32
    $font = New-Object System.Drawing.Font('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 251, 245))
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = 'Center'
    $fmt.LineAlignment = 'Center'
    $g.DrawString(('J' + [char]0xEB), $font, $whiteBrush, (New-Object System.Drawing.PointF($cx, $cy)), $fmt)

    $g.Dispose()
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "OK $path"
}

New-PwaIcon 192 'C:\Users\HP\Downloads\mboro-market\frontend\public\pwa\icon-192.png'
New-PwaIcon 512 'C:\Users\HP\Downloads\mboro-market\frontend\public\pwa\icon-512.png'
