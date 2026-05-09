# Create or update GCP Secret Manager secrets from local files or environment
# Usage: .\create-gcp-secrets.ps1 -ProjectId promptwars-495019
param(
    [string]$ProjectId = "promptwars-495019",
    [string]$ServiceAccountPath = "agent-service/serviceAccountKey.json",
    [string]$EnvFile = "agent-service/.env"
)

function CreateOrUpdate-Secret {
    param(
        [string]$Name,
        [string]$Value
    )
    try {
        gcloud secrets describe $Name --project $ProjectId > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Adding new secret version for $Name"
            $tmp = [System.IO.Path]::GetTempFileName()
            Set-Content -Path $tmp -Value $Value -Encoding utf8
            gcloud secrets versions add $Name --data-file=$tmp --project $ProjectId
            Remove-Item $tmp -Force
        } else {
            Write-Host "Creating secret $Name"
            $tmp = [System.IO.Path]::GetTempFileName()
            Set-Content -Path $tmp -Value $Value -Encoding utf8
            gcloud secrets create $Name --replication-policy="automatic" --data-file=$tmp --project $ProjectId
            Remove-Item $tmp -Force
        }
    } catch {
        Write-Error ("Failed to create/update secret {0}: {1}" -f $Name, $_)
    }
}

# Load GEMINI_API_KEY from .env if present
$gemini = $null
if (Test-Path $EnvFile) {
    $content = Get-Content $EnvFile | Where-Object { $_ -match "^GEMINI_API_KEY=" }
    if ($content) {
        $gemini = ($content -replace "^GEMINI_API_KEY=", "").Trim()
    }
}
if ([string]::IsNullOrWhiteSpace($gemini)) {
    $gemini = Read-Host -Prompt "Enter GEMINI_API_KEY (will not be echoed)" -AsSecureString
    $gemini = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($gemini))
}
CreateOrUpdate-Secret -Name "GEMINI_API_KEY" -Value $gemini

# Upload firebase service account JSON if it exists
if (Test-Path $ServiceAccountPath) {
    $json = Get-Content $ServiceAccountPath -Raw
    CreateOrUpdate-Secret -Name "FIREBASE_SERVICE_ACCOUNT_JSON" -Value $json
} else {
    Write-Host "Service account path $ServiceAccountPath not found; skipping FIREBASE_SERVICE_ACCOUNT_JSON creation."
}

Write-Host "Done. Secrets created/updated in project $ProjectId."
