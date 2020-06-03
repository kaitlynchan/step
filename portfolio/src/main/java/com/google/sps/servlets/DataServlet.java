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

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.Iterator;
import com.google.gson.Gson;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.sps.data.Comment;


/** Servlet that returns some example content. TODO: modify this file to handle comments data */
@WebServlet("/data")
public class DataServlet extends HttpServlet {

  private int limitComments(HttpServletRequest request) {
    String numCommentsString = request.getParameter("numComments");
    
    int numComments;
    try {
        numComments = Integer.parseInt(numCommentsString);
    } catch (NumberFormatException e) {
        System.err.println("Could not convert to int: " + numCommentsString);
        return -1;
    }

    if (numComments < 1) {
        System.err.println("Comment number is out of range: " + numCommentsString);
        return -1;
    }

    return numComments;
  }
    
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    int numComments = limitComments(request);
    System.out.println(numComments);

    if (numComments == -1) {
      //read the comment data from the server and display
      String json = new Gson().toJson("invalid numComments");
      response.setContentType("application/json;");
      response.getWriter().println(json);
      return;
    }

    Query query = new Query("Comment").addSort("timestamp", SortDirection.DESCENDING);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    Iterator<Entity> resultsList = results.asIterator();

    ArrayList<Comment> comments = new ArrayList<>();
    int counter = 0;
    while (resultsList.hasNext() && counter < numComments) {
        //System.out.println(counter);
        Entity entity = resultsList.next();
        long id = entity.getKey().getId();
        String name = (String) entity.getProperty("name");
        String text = (String) entity.getProperty("text");
        long timestamp = (long) entity.getProperty("timestamp");

        Comment comment = new Comment(id, name, text, timestamp);
        comments.add(comment);
        counter += 1;
    }

    // for (Entity entity : results.asIterable()) {
    //   long id = entity.getKey().getId();
    //   String name = (String) entity.getProperty("name");
    //   String text = (String) entity.getProperty("text");
    //   long timestamp = (long) entity.getProperty("timestamp");

    //   Comment comment = new Comment(id, name, text, timestamp);
    //   comments.add(comment);
    // }

    //read the comment data from the server and display
    String json = new Gson().toJson(comments);
    response.setContentType("application/json;");
    response.getWriter().println(json);
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    //get inputs from the form
    String inputName = request.getParameter("name");
    String inputComment = request.getParameter("text");
    //can do data processing here
    
    long timestamp = System.currentTimeMillis();

    Entity commentEntity = new Entity("Comment");
    commentEntity.setProperty("name", inputName);
    commentEntity.setProperty("text", inputComment);
    commentEntity.setProperty("timestamp", timestamp);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(commentEntity);

    // Redirect back to the HTML page.
    response.sendRedirect("/audio.html");
  }
}
