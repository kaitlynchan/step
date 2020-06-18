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

package com.google.sps;

import java.util.Collection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.HashSet;
import java.util.Set;

public final class FindMeetingQuery {

  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {

      HashSet<String> optionalAttendees = new HashSet<String>(request.getOptionalAttendees());
      HashSet<String> mandatoryAttendees = new HashSet<String>(request.getAttendees());

      //if no optional attendees, return call to queryMandatory
      if (mandatoryAttendees.isEmpty() && optionalAttendees.isEmpty()) {
          return queryMandatory(events, request);
      }

      //if optional attendees present, merge groups of attendees
      HashSet<String> mergedAttendees = new HashSet<String>();
      mergedAttendees.addAll(optionalAttendees);
      mergedAttendees.addAll(mandatoryAttendees);
      long duration = request.getDuration();
      MeetingRequest mergedRequest = new MeetingRequest(mergedAttendees, duration);
      //query on all attendees as mandatory
      Collection<TimeRange> mergedTimes = queryMandatory(events, mergedRequest);

      if (mergedTimes.isEmpty() && !mandatoryAttendees.isEmpty()) {
          //if no times work for merged groups, query for only mandatory
          return queryMandatory(events, request);
      }
      //else, there are merged times that work!
      return mergedTimes;
  }


  public Collection<TimeRange> queryMandatory(Collection<Event> events, MeetingRequest request) {
    //return a collection of TimeRanges that work given known events and a meeting request

    //if no attendees in the mtg req, return the whole day as a collection of possible times
    if (request.getAttendees().isEmpty()) {
        return Arrays.asList(TimeRange.WHOLE_DAY);
    } 

    //if meeting duration is longer than a day, then return no possible times
    if (request.getDuration() > TimeRange.WHOLE_DAY.duration()) {
        return Arrays.asList();
    } 
    
    ArrayList<TimeRange> possibleTimes = new ArrayList<TimeRange>();
    ArrayList<TimeRange> eventTimes = new ArrayList<TimeRange>();
    //Cast the collection of events into a sortable Array List
    ArrayList<Event> eventsArr = new ArrayList<Event>(events);

    HashSet<String> mtgAttendees = new HashSet<String>(request.getAttendees());
    long duration = request.getDuration();
    //pointer to track TRs
    int currentTime = TimeRange.START_OF_DAY;

    //sort all the events by TR
    Collections.sort(eventsArr, Event.ORDER_BY_START);

    for (Event event : eventsArr) {
        Set<String> eventAttendees = event.getAttendees(); //can't modify
        HashSet<String> intersection = new HashSet<String>(eventAttendees); // use the copy constructor
        //intersection of event and meeting attendees
        intersection.retainAll(mtgAttendees);

        if (!intersection.isEmpty()) {
            //track the first event of the day
            if (eventTimes.isEmpty()) {
                eventTimes.add(event.getWhen());
            } else {
                TimeRange prevTR = eventTimes.get(eventTimes.size()-1);
                //only add new TR if isn't nested
                if(!prevTR.contains(event.getWhen())) {
                    eventTimes.add(event.getWhen());
                }
            }
        }
    }

    //Start from the beginning of the day and build TimeRanges
    for (TimeRange time : eventTimes) {
        TimeRange currentTR = TimeRange.fromStartEnd(currentTime, time.start(), false);
        //if event overlaps with previous event, duration is negative
        if (currentTR.duration() >= duration) {
            possibleTimes.add(currentTR);
        }
        //update the time pointer to the end of the TR
        currentTime = time.end();
    }
    //add the last section of time in the day (inclusive)
    if (TimeRange.END_OF_DAY - currentTime + 1 >= duration) {
        TimeRange currentTR = TimeRange.fromStartEnd(currentTime, TimeRange.END_OF_DAY, true);
        possibleTimes.add(currentTR);
    }
    
    return possibleTimes;
  }
}
