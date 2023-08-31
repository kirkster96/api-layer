/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

package org.zowe.apiml.cloudgatewayservice.service;

import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.openssl.jcajce.JcaPEMWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.zowe.apiml.message.log.ApimlLogger;
import org.zowe.apiml.message.yaml.YamlMessageServiceInstance;
import org.zowe.apiml.security.HttpsConfig;
import org.zowe.apiml.security.HttpsConfigError;
import org.zowe.apiml.security.SecurityUtils;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.StringWriter;
import java.security.cert.Certificate;

/**
 * This service provides gateway's certificate chain which is used for the southbound communication
 */
@Service
@Slf4j
public class CertificateChainService {

    //TODO Once the separate configuration of keystore for client is implemented (PR https://github.com/zowe/api-layer/pull/3051) then update this SSL configuration.
    @Value("${server.ssl.keyStore:#{null}}")
    private String keyStore;

    @Value("${server.ssl.keyStorePassword:#{null}}")
    private char[] keyStorePassword;

    @Value("${server.ssl.keyPassword:#{null}}")
    private char[] keyPassword;

    @Value("${server.ssl.keyStoreType:PKCS12}")
    private String keyStoreType;

    @Value("${server.ssl.keyAlias:#{null}}")
    private String keyAlias;

    private static final ApimlLogger apimlLog = ApimlLogger.of(CertificateChainService.class, YamlMessageServiceInstance.getInstance());
    Certificate[] certificates;

    public String getCertificatesInPEMFormat() {
        StringWriter stringWriter = new StringWriter();
        if (certificates != null && certificates.length > 0) {
            try (JcaPEMWriter jcaPEMWriter = new JcaPEMWriter(stringWriter)) {
                for (Certificate cert : certificates) {
                    jcaPEMWriter.writeObject(cert);
                }
            } catch (IOException e) {
                log.error("Failed to convert a certificate to PEM format. {}", e.getMessage());
                return null;
            }
        }

        return stringWriter.toString();
    }

    @PostConstruct
    void loadCertChain() {
        HttpsConfig config = HttpsConfig.builder()
            .keyAlias(keyAlias)
            .keyStore(keyStore)
            .keyPassword(keyPassword)
            .keyStorePassword(keyStorePassword)
            .keyStoreType(keyStoreType)
            .build();
        try {
            certificates = SecurityUtils.loadCertificateChain(config);
        } catch (Exception e) {
            apimlLog.log("org.zowe.apiml.common.sslContextInitializationError", e.getMessage());
            throw new HttpsConfigError("Error initializing SSL Context: " + e.getMessage(),
                e, HttpsConfigError.ErrorCode.HTTP_CLIENT_INITIALIZATION_FAILED, config);
        }
    }
}
