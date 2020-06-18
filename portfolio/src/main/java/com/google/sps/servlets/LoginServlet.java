// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import com.google.sps.data.Login;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    UserService userService = UserServiceFactory.getUserService();
    boolean loginStatus = userService.isUserLoggedIn();

    String urlToRedirectToAfterUserLogsOut = "/audio.html";
    String logoutUrl = userService.createLogoutURL(urlToRedirectToAfterUserLogsOut);
    
    String urlToRedirectToAfterUserLogsIn = "/audio.html";
    String loginUrl = userService.createLoginURL(urlToRedirectToAfterUserLogsIn);

    String nickname = null;
    //if logged in, get the nickname
    if (userService.isUserLoggedIn()) {
        nickname = getUserNickname(userService.getCurrentUser().getUserId());
        //System.out.println("userid: "+ userService.getCurrentUser().getUserId());
    }

    //create login object with status and links
    Login login = new Login(loginStatus, logoutUrl, loginUrl, nickname);

    String json = new Gson().toJson(login);
    response.setContentType("application/json;");
    response.getWriter().println(json);
  }

    /** Returns the nickname of the user with id, or null if the user has not set a nickname. */
  private String getUserNickname(String id) {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query query =
        new Query("UserInfo")
            .setFilter(new Query.FilterPredicate("id", Query.FilterOperator.EQUAL, id));
    PreparedQuery results = datastore.prepare(query);
    Entity entity = results.asSingleEntity();
    if (entity == null) {
      return null;
    }
    String nickname = (String) entity.getProperty("nickname");
    return nickname;
  }
}
