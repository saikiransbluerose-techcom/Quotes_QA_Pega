pipeline {
    agent any

    environment {
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
                // package.json is at repo root now
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
            // Publish Playwright HTML report (HTML Publisher plugin required)
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright HTML Report'
            ])

            // Also archive reports as artifacts
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
        }
    }
}
