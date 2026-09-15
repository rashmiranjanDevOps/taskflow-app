```groovy
pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = 'rashmiranjandevops/taskflow-frontend'
        BACKEND_IMAGE  = 'rashmiranjandevops/taskflow-backend'
        IMAGE_TAG      = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-taskflow-read',
                    url: 'https://github.com/rashmiranjanDevOps/taskflow-app.git'
            }
        }

        stage('Build') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }

                dir('backend') {
                    sh 'npm ci --omit=dev'
                }
            }
        }

        stage('Test') {
            steps {
                dir('frontend') {
                    sh 'npm test'
                }
            }
        }

        stage('Package') {
            steps {
                sh '''
                    tar -czf taskflow-package-${BUILD_NUMBER}.tar.gz \
                    frontend/dist \
                    backend/src \
                    backend/package.json \
                    backend/package-lock.json \
                    frontend/package.json \
                    frontend/package-lock.json \
                    docker-compose.yml
                '''

                archiveArtifacts artifacts: "taskflow-package-${BUILD_NUMBER}.tar.gz",
                                 fingerprint: true
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build \
                        --build-arg VITE_API_URL=http://18.60.58.93:5000 \
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        ./frontend

                    docker build \
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        ./backend

                    docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        ${FRONTEND_IMAGE}:latest

                    docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        ${BACKEND_IMAGE}:latest
                '''
            }
        }

        stage('Security Scan') {
            steps {
                sh '''
                    mkdir -p security-reports

                    echo "========================================"
                    echo "Scanning Frontend Docker Image"
                    echo "========================================"

                    trivy image \
                        --scanners vuln,misconfig \
                        --severity HIGH,CRITICAL \
                        --format table \
                        ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        | tee security-reports/frontend-trivy.txt

                    echo "========================================"
                    echo "Scanning Backend Docker Image"
                    echo "========================================"

                    trivy image \
                        --scanners vuln,misconfig \
                        --severity HIGH,CRITICAL \
                        --format table \
                        ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        | tee security-reports/backend-trivy.txt

                    echo "========================================"
                    echo "Security Scan Reports Generated"
                    echo "========================================"
                '''

                archiveArtifacts artifacts: 'security-reports/*.txt',
                                 fingerprint: true

                sh '''
                    echo "========================================"
                    echo "Security Gate - Frontend"
                    echo "========================================"

                    trivy image \
                        --scanners vuln,misconfig \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        --format table \
                        ${FRONTEND_IMAGE}:${IMAGE_TAG}

                    echo "========================================"
                    echo "Security Gate - Backend"
                    echo "========================================"

                    trivy image \
                        --scanners vuln,misconfig \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        --format table \
                        ${BACKEND_IMAGE}:${IMAGE_TAG}
                '''
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKERHUB_USER',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    )
                ]) {
                    sh '''
                        echo "$DOCKERHUB_TOKEN" | docker login \
                            -u "$DOCKERHUB_USER" \
                            --password-stdin

                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE}:latest

                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:latest
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'TaskFlow DevSecOps CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check the Console Output.'
        }

        always {
            sh 'docker logout || true'
        }
    }
}
```
