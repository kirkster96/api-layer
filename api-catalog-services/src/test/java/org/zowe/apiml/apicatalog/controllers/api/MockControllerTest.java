/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

package org.zowe.apiml.apicatalog.controllers.api;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebMvcTest(
    controllers = { MockController.class },
    excludeAutoConfiguration = { SecurityAutoConfiguration.class}
)
@ContextConfiguration(classes = MockControllerTest.Context.class)
class MockControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Nested
    class GivenEnabledController {

        @Test
        void whenGetRequest() throws Exception {
            mockMvc.perform(get("/mock/something"))
                .andExpect(status().isOk())
                .andExpect(content().string("{}"));
        }

        @Test
        void whenPostRequest() throws Exception {
            mockMvc.perform(post("/mock/something"))
                    .andExpect(status().isOk())
                    .andExpect(content().string("{}"));
        }

    }

    @Configuration
    static class Context {

        @Bean
        public MockController mockController() {
            return new MockController();
        }

    }

}