pipeline {
    agent any

    environment {
        // Forces Playwright to run headless on Jenkins to avoid display errors
        CI = 'true'

        // Credentials from Jenkins (Manage Jenkins > Credentials)
        PDN_USER = credentials('PDN_USER')
        PDN_PASS = credentials('PDN_PASS')
        CSR_USER = credentials('CSR_USER')
        CSR_PASS = credentials('CSR_PASS')

        // URLs (non-secret)
        PDN_URL = 'https://pegalabs.pega.com/ui/system/cddd8f50-0220-47b5-9954-62beb8c85e1b'
        ENV_URL = 'https://bluerosetech01.pegalabs.io/prweb'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                // package.json is at repo root
                bat 'npm install'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                bat 'npx playwright install chromium'
            }
        }

        stage('Run ONLY loginTest_v1.spec.js') {
            steps {
                bat """
                    set DATA_KEY=Data Variant 1
                    set PDN_URL=${env.PDN_URL}
                    set ENV_URL=${env.ENV_URL}
                    set PDN_USER=${env.PDN_USER}
                    set PDN_PASS=${env.PDN_PASS}
                    set CSR_USER=${env.CSR_USER}
                    set CSR_PASS=${env.CSR_PASS}

                    npx playwright test QuotePolicyProcess/tests/loginTest_v1.spec.js --reporter=html
                """
            }
        }
    }

    post {
        always {
            // 1. Publish Playwright HTML report (requires HTML Publisher plugin)
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report'
            ])

            // 2. Archive the full report folder
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true

            // 3. Archive Screenshots (on failure)
            archiveArtifacts artifacts: 'test-results/**/*.png', allowEmptyArchive: true

            // 4. Archive Video Recordings (on failure)
            archiveArtifacts artifacts: 'test-results/**/*.webm', allowEmptyArchive: true

            // 5. Archive Trace Files (on failure)
            archiveArtifacts artifacts: 'test-results/**/*.zip', allowEmptyArchive: true
        }
    }
}
