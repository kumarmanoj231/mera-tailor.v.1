Add-Type -AssemblyName System.Drawing

$srcPath = (Resolve-Path "public/assets/roles/roles_avatars.png").Path
$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Centers:
# Customer: Center=(154, 244)
# Tailor:   Center=(392, 243)
# Business: Center=(628, 243)
# Admin:    Center=(862, 243)
# Inner face diameter: ~194px -> radius 97px
$roles = @(
    @{ Name = "customer"; Cx = 154; Cy = 244 },
    @{ Name = "tailor";   Cx = 392; Cy = 243 },
    @{ Name = "business"; Cx = 628; Cy = 243 },
    @{ Name = "admin";    Cx = 862; Cy = 243 }
)

$cropSize = 192
$half = [int]($cropSize / 2)

foreach ($r in $roles) {
    $x = $r.Cx - $half
    $y = $r.Cy - $half
    $rect = New-Object System.Drawing.Rectangle($x, $y, $cropSize, $cropSize)
    $cropped = New-Object System.Drawing.Bitmap($cropSize, $cropSize)
    $g = [System.Drawing.Graphics]::FromImage($cropped)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($srcBmp, (New-Object System.Drawing.Rectangle(0, 0, $cropSize, $cropSize)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()

    $outPath = "public/assets/roles/$($r.Name).png"
    $cropped.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    Write-Host "Saved $outPath ($cropSize x $cropSize)"
}

$srcBmp.Dispose()
