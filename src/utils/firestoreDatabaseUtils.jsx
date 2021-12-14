import {
  addDoc,
  collection,
  doc,
  arrayUnion,
  arrayRemove,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase-config";

// firestore - create new group
async function createNewGroup(currentUser, groupName) {
  const newGroup = await addDoc(collection(db, "groups"), {
    groupAdmin: {
      username: currentUser,
      ready: false,
    },
    groupName: groupName,
    groupMembers: [],
    trip: {
      started: false,
      tripId: null,
    },
  });

  const groupId = newGroup.path.substring(7);
  // add document number to the group as groupId
  const groupDocSnap = await getDoc(doc(db, "groups", groupId));
  await updateDoc(doc(db, "groups", groupId), {
    groupId: groupId,
  });

  // console.log the document path in the firestore database within the "groups" collection
  console.log(`A new group was created at ${newGroup.path}`);

  return groupId;
}

// firestore - request to join a group - adds user to group Members field with status "Approved: false"
async function joinGroupRequest(currentUser, groupDocId) {
  // reads document from the firestore database
  const groupDocSnap = await getDoc(doc(db, "groups", groupDocId));

  // takes the groupMembers object and updates object with new member if they aren't already in the group
  if (!groupDocSnap.data().groupMembers[currentUser]) {
    const groupMembers = groupDocSnap.data().groupMembers;

    groupMembers[currentUser] = {
      approved: false,
      ready: false,
      username: currentUser,
    };

    await updateDoc(doc(db, "groups", groupDocId), {
      groupMembers: groupMembers,
    });

    console.log(`${currentUser} was added to group ${groupDocId}`);
  } else {
    console.log(`${currentUser} is already a group member`);
  }
}

// firestore - approve group request - updates groupMembers field with status "Approved: true"
async function approveGroupRequest(groupMember, groupDocId) {
  // reads document from the firestore database
  const groupDocSnap = await getDoc(doc(db, "groups", groupDocId));

  // takes the groupMembers object and updates approved status
  if (groupDocSnap.data().groupMembers[groupMember]) {
    const groupMembers = groupDocSnap.data().groupMembers;

    (groupMembers[`${groupMember}`]["approved"] = true),
      await updateDoc(doc(db, "groups", groupDocId), {
        groupMembers,
      });

    console.log(
      `${groupMember} has been approved to join the group ${groupDocId}`
    );
  } else {
    console.log(`${groupMember} can't be found in group members`);
  }
}

// firestore - readyUp- updates groupMembers field with status "ready: true"
async function readyUp(groupMember, groupDocId) {
  // reads document from the firestore database
  const groupDocSnap = await getDoc(doc(db, "groups", groupDocId));

  // takes the groupMembers object and updates ready status
  if (groupDocSnap.data().groupMembers[groupMember]) {
    const groupMembers = groupDocSnap.data().groupMembers;

    (groupMembers[`${groupMember}`]["ready"] = true),
      await updateDoc(doc(db, "groups", groupDocId), {
        groupMembers,
      });

    console.log(`${groupMember} is ready`);
  } else {
    console.log(`${groupMember} can't be found in group members`);
  }
}

// firestore - readyUpAdmin- updates groupAdmin field with status "ready: true"
async function readyUpAdmin(groupDocId) {
  // reads document from the firestore database
  const groupDocSnap = await getDoc(doc(db, "groups", groupDocId));

  // takes the groupMembers object and updates ready status
  if (groupDocSnap.exists()) {
    await updateDoc(doc(db, "groups", groupDocId), {
      "groupAdmin.ready": true,
    });

    console.log(`Group admin is ready`);
  } else {
    console.log(`Group can't be found`);
  }
}

// firestore - notReady- updates groupMembers field with status "ready: false"
async function notReady(groupMember, groupDocId) {
  // reads document from the firestore database
  const groupDocSnap = await getDoc(doc(db, "groups", groupDocId));

  // takes the groupMembers object and updates ready status
  if (groupDocSnap.data().groupMembers[groupMember]) {
    const groupMembers = groupDocSnap.data().groupMembers;

    (groupMembers[`${groupMember}`]["ready"] = false),
      await updateDoc(doc(db, "groups", groupDocId), {
        groupMembers,
      });

    console.log(`${groupMember} is ready`);
  } else {
    console.log(`${groupMember} can't be found in group members`);
  }
}

// firestore - notReadyAdmin- updates groupAdmin field with status "ready: false"
async function notReadyAdmin(groupDocId) {
  // reads document from the firestore database
  const groupDocSnap = await getDoc(doc(db, "groups", groupDocId));

  // takes the groupMembers object and updates ready status
  if (groupDocSnap.exists()) {
    await updateDoc(doc(db, "groups", groupDocId), {
      "groupAdmin.ready": false,
    });

    console.log(`Group admin is ready`);
  } else {
    console.log(`Group can't be found`);
  }
}

// firestore - create new trip within group
async function createNewTrip(currentUser, groupDocId, groupName) {
  const newTrip = await addDoc(collection(db, "trips"), {
    admin: currentUser,
    archive: false,
    groupId: groupDocId,
    groupName: groupName,
    tripMembers: {},
    trip: {
      started: false,
      tripId: null,
    },
  });

  const tripId = newTrip.path.substring(6);
  // add document number to the trip as tripId

  console.log(`A new trip was created at ${newTrip.path}`);

  // updates trip properties in trip
  await updateDoc(doc(db, "trips", tripId), {
    "trip.started": true,
    "trip.tripId": tripId,
  });

  // updates trip properties in group
  await updateDoc(doc(db, "groups", groupDocId), {
    "trip.started": true,
    "trip.tripId": tripId,
  });

  console.log(`Trip ${tripId} has started`);

  return tripId;
}

// firestore - update location in trip
async function updateLocation(currentUser, tripId, latitude, longitude) {
  // creates/updates an object in the Trip under tripMembers

  // reads document from the firestore database
  const tripDocSnap = await getDoc(doc(db, "trips", tripId));

  // takes the tripMembers object and updates ready status
  const tripMembers = tripDocSnap.data().tripMembers;

  await updateDoc(doc(db, "trips", tripId), {
    [`tripMembers.${currentUser}.username`]: currentUser,
    [`tripMembers.${currentUser}.latitude`]: latitude,
    [`tripMembers.${currentUser}.longitude`]: longitude,
  });

  console.log(`tripmember ${currentUser} updated`);
}

// firestore - end trip within group
async function endTrip(tripId) {
  // updates trip properties in trip
  await updateDoc(doc(db, "trips", tripId), {
    "trip.started": false,
    archive: true,
  });

  // reads document from the firestore database for group ID
  const tripDocSnap = await getDoc(doc(db, "trips", tripId));

  // updates trip properties in group
  await updateDoc(doc(db, "groups", tripDocSnap.data().groupId), {
    "trip.started": false,
    "trip.tripId": null,
  });

  console.log(`Trip ${tripId} has ended`);
}

export {
  createNewGroup,
  joinGroupRequest,
  approveGroupRequest,
  readyUp,
  readyUpAdmin,
  notReady,
  notReadyAdmin,
  createNewTrip,
  updateLocation,
  endTrip,
};
