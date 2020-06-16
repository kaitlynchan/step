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
    //return a collection of TimeRanges that work given known events and a meeting request

    //@Test optionsForNoAttendees()
    //if no attendees in the mtg req, return the whole day as a collection of possible times
    if (request.getAttendees().isEmpty()) {
        return Arrays.asList(TimeRange.WHOLE_DAY);
    } 
    //@Test noOptionsForTooLongOfARequest()
    //if meeting duration is longer than a day, then return no possible times
    if (request.getDuration() > TimeRange.WHOLE_DAY.duration()) {
        return Arrays.asList();
    } 
    
    //@Test eventSplitsRestriction()
    //Two possible TimeRanges: before and after the event
    //ArrayLists are Collections already
    ArrayList<TimeRange> possibleTimes = new ArrayList<TimeRange>();
    ArrayList<TimeRange> eventTimes = new ArrayList<TimeRange>();

    HashSet<String> mtgAttendees = new HashSet<String>(request.getAttendees());
    long duration = request.getDuration();

    int currentTime = TimeRange.START_OF_DAY;
    
    //System.out.println(events.toString());

    for (Event event : events) {
        Set<String> eventAttendees = event.getAttendees(); //can't modify
        HashSet<String> intersection = new HashSet<String>(eventAttendees); // use the copy constructor

        intersection.retainAll(mtgAttendees);
        System.out.print("Intersection: ");
        System.out.println(intersection.toString());
        //s1.retainAll(s2) — transforms s1 into the intersection of s1 and s2. 
        //if there are event attendees invited to the meeting, keep track of the event time
        if (!intersection.isEmpty()) {
            //do not add TR if it is nested
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
    //sort relevant events by TimeRanges
    Collections.sort(eventTimes, TimeRange.ORDER_BY_START);
    System.out.print("Event Times: ");
    System.out.println(eventTimes.toString());
    //Start from the beginning of the day and build TimeRanges
    for (TimeRange time : eventTimes) {
        System.out.println(currentTime);
        TimeRange currentTR = TimeRange.fromStartEnd(currentTime, time.start(), false);
        //if event overlaps with previous event, duration is negative
        if (currentTR.duration() >= duration) {
            possibleTimes.add(currentTR);
        }
        currentTime = time.end();
    }
    //add the last section of time in the day (inclusive)
    if (TimeRange.END_OF_DAY - currentTime + 1 >= duration) {
        TimeRange currentTR = TimeRange.fromStartEnd(currentTime, TimeRange.END_OF_DAY, true);
        possibleTimes.add(currentTR);
    }
    System.out.print("Possible Times: ");
    System.out.println(possibleTimes.toString());
    //TimeRange.fromStartEnd(TimeRange.START_OF_DAY, TIME_0830AM, false
    //TimeRange.fromStartDuration(TIME_0800AM, DURATION_30_MINUTES)

    return possibleTimes;
  }
}
