import { makeAutoObservable, runInAction } from "mobx";

import { auth, db, functions } from "./firebase";
import {
  onAuthStateChanged,
  signInAnonymously,
  getAuth,
  EmailAuthProvider,
  linkWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  onSnapshot,
  updateDoc,
  getDocs,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { rooms } from "./data";
import { httpsCallable } from "firebase/functions";

const DEFAULT_USER = {
  isCreator: true,
};

class Store {
  user = null;
  loading = false;
  isMobileOpen = false;

  // Projects Creator
  projects = [];
  pages = [];
  items = [];
  stats = [];

  activePage = {
    name: "",
    description: "",
    options: [],
    page: 0,
    img: "",
  };

  // Game State
  inventory = [];
  usedOptions = [];

  constructor() {
    makeAutoObservable(this);
    this.initializeAuth();
    this.handleOptionClick = this.handleOptionClick.bind(this);
    this.setActivePage = this.setActivePage.bind(this);
    this.updateStat = this.updateStat.bind(this);
    this.addItemToInventory = this.addItemToInventory.bind(this);
    this.isOptionUnlocked = this.isOptionUnlocked.bind(this);
    this.findItem = this.findItem.bind(this);
    this.findStat = this.findStat.bind(this);
    this.hasItem = this.hasItem.bind(this);
    this.meetsStatCondition = this.meetsStatCondition.bind(this);
    this.useOption = this.useOption.bind(this);
    this.getOptionUsage = this.getOptionUsage.bind(this);
    this.initializeAuth = this.initializeAuth.bind(this);
    this.loginWithEmail = this.loginWithEmail.bind(this);
    this.signupWithEmail = this.signupWithEmail.bind(this);
    this.logout = this.logout.bind(this);
    this.signInWithGoogle = this.signInWithGoogle.bind(this);
    this.sendPasswordReset = this.sendPasswordReset.bind(this);
    this.getProjects = this.getProjects.bind(this);
    this.createProject = this.createProject.bind(this);
    this.updateProject = this.updateProject.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
    this.createItemWithImage = this.createItemWithImage.bind(this);
    this.updateItemWithImage = this.updateItemWithImage.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.createStatWithImage = this.createStatWithImage.bind(this);
    this.updateStatWithImage = this.updateStatWithImage.bind(this);
    this.deleteStat = this.deleteStat.bind(this);
    this.fetchItems = this.fetchItems.bind(this);
    this.fetchStats = this.fetchStats.bind(this);
    this.fetchPages = this.fetchPages.bind(this);
    this.createPage = this.createPage.bind(this);
    this.uploadImageToPage = this.uploadImageToPage.bind(this);
    this.removeImageFromPage = this.removeImageFromPage.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.reduceStat = this.reduceStat.bind(this);
    this.addItemToInventory = this.addItemToInventory.bind(this);
    this.removeItemFromInventory = this.removeItemFromInventory.bind(this);
    this.checkPageNumberExists = this.checkPageNumberExists.bind(this);
    this.findMissingPagesFromOptions =
      this.findMissingPagesFromOptions.bind(this);
    this.setLoading = this.setLoading.bind(this);
    this.magicGeneratePage = this.magicGeneratePage.bind(this);
    this.updatePageMobx = this.updatePageMobx.bind(this);
    this.deleteOptionFromPage = this.deleteOptionFromPage.bind(this);
    this.deletePage = this.deletePage.bind(this);
    this.uploadProjectAvatar = this.uploadProjectAvatar.bind(this);
    this.removeProjectAvatar = this.removeProjectAvatar.bind(this);
  }

  initializeAuth() {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        runInAction(() => {
          this.user = { uid: user.uid, ...userDoc.data() };
          this.getProjects(user.uid);
        });
      } else {
        runInAction(() => {
          this.user = null;
        });
      }
    });
  }

  setLoading(isLoading) {
    this.loading = isLoading;
  }

  // FIREBASE FUNCTIONS / GENERATE AI

  updatePageMobx = async (pageId, changes) => {
    runInAction(() => {
      const index = this.pages.findIndex((page) => page.id === pageId);
      if (index !== -1) {
        this.pages[index] = { ...this.pages[index], ...changes };
      }
      this.activePage = { ...this.activePage, ...changes };
      this.loading = false;
    });
  };

  async magicGeneratePage(projectId, pageId, prompt, withImage, optionsCount) {
    const magicCreatePage = httpsCallable(functions, "magicCreatePage");
    try {
      const result = await magicCreatePage({
        projectId,
        pageId,
        prompt: prompt.length > 500 ? prompt.slice(0, 500) : prompt,
        withImage,
        optionsCount: optionsCount > 3 ? 3 : optionsCount,
        lastPage: this.activePage.page,
      });

      console.log("GPT Response:", result.data.gptResponse);
      console.log("Image Response:", result.data.imageUrl);
      const structuredDataString =
        result.data.gptResponse.choices[0].message.content;
      const structuredDataObject = JSON.parse(structuredDataString);

      const { name, description, options } = structuredDataObject;

      const pageRef = doc(db, "pages", pageId);
      await updateDoc(pageRef, {
        name,
        description,
        options,
        img: result.data.imageUrl,
      });

      this.updatePageMobx(pageId, {
        name,
        description,
        options,
        img: result.data.imageUrl,
      });
    } catch (error) {
      console.error("Error generating page:", error);
    }
  }

  // Pages
  async fetchPages(projectId) {
    this.loading = true;
    try {
      const q = query(
        collection(db, "pages"),
        where("projectId", "==", projectId)
      );
      const querySnapshot = await getDocs(q);
      const pages = [];
      querySnapshot.forEach((doc) => {
        pages.push({ id: doc.id, ...doc.data() });
      });

      runInAction(() => {
        this.pages = pages;
        if (!this.activePage.name) {
          this.activePage = pages[0];
        }
        this.loading = false;
      });
    } catch (error) {
      console.error("Error fetching pages:", error);
      this.loading = false;
    }
  }

  async uploadImageToPage(projectId, pageId, imageFile) {
    this.loading = true;
    try {
      if (!imageFile) {
        throw new Error("No image file provided.");
      }

      const storage = getStorage();

      const imageFileName = encodeURIComponent(imageFile.name);

      const storagePath = `projects/${projectId}/pages/${pageId}/${imageFileName}`;

      const imageRef = storageRef(storage, storagePath);

      const uploadResult = await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      const pageRef = doc(db, "pages", pageId);

      await updateDoc(pageRef, { img: imageUrl, imgFilename: imageFileName });

      runInAction(() => {
        const index = this.pages.findIndex((page) => page.id === pageId);
        if (index !== -1) {
          this.pages[index].img = imageUrl;
        }

        this.loading = false;
      });
    } catch (error) {
      console.error("Error uploading image to page:", error);
      this.loading = false;
    }
  }

  async removeImageFromPage(projectId, pageId, imgFilename) {
    this.loading = true;
    try {
      // Define the storage path. This should match the path used for uploading.
      const storage = getStorage();
      const imageFileName = encodeURIComponent(imgFilename);
      const storagePath = `projects/${projectId}/pages/${pageId}/${imageFileName}`;

      // Reference to the file in the storage
      const imageRef = storageRef(storage, storagePath);

      // Delete the file
      await deleteObject(imageRef);

      // Remove the image URL from the Firestore document
      const pageRef = doc(db, "pages", pageId);
      await updateDoc(pageRef, { img: null });

      // Update local state (if necessary)
      runInAction(() => {
        const index = this.pages.findIndex((page) => page.id === pageId);
        if (index !== -1) {
          this.pages[index].img = null;
        }
        this.loading = false;
      });
    } catch (error) {
      console.error("Error removing image from page:", error);
      this.loading = false;
    }
  }

  async createPage(projectId, pageData) {
    this.loading = true;

    try {
      const newPageData = { ...pageData };
      const newPageRef = await addDoc(collection(db, "pages"), {
        ...newPageData,
        projectId: projectId,
      });

      runInAction(() => {
        this.pages.push({ id: newPageRef.id, ...newPageData });
        this.loading = false;
      });
    } catch (error) {
      console.error("Error creating stat with image:", error);
      this.loading = false;
    }
  }

  async updatePage(pageId, updatesDate) {
    this.loading = true;
    try {
      const pageRef = doc(db, "pages", pageId);
      await updateDoc(pageRef, updatesDate);

      this.updatePageMobx(pageId, updatesDate);
    } catch (error) {
      console.error("Error updating page:", error);
      this.loading = false;
    }
  }

  async deletePage() {
    this.loading = true;
    try {
      // Assuming activePage includes projectId, pageId, imgFilename
      const { projectId, imgFilename, id } = this.activePage;

      const pageId = id;

      // Delete the image from Firebase Storage if an image filename is present
      if (imgFilename) {
        const storagePath = `projects/${projectId}/pages/${pageId}/${imgFilename}`;
        const imageRef = storageRef(getStorage(), storagePath);
        await deleteObject(imageRef); // Make sure to import deleteObject from "firebase/storage"
      }

      // Delete the Firestore document
      const pageRef = doc(db, "pages", pageId);
      await deleteDoc(pageRef);

      runInAction(() => {
        // Remove the page from your MobX state
        this.pages = this.pages.filter((page) => page.id !== pageId);
        // Reset or update activePage as necessary
        this.activePage = pages[0];
        this.loading = false;
      });
    } catch (error) {
      console.error("Error deleting page:", error);
      this.loading = false;
    }
  }

  async deleteOptionFromPage(pageId, optionIndex) {
    this.loading = true;
    try {
      // Remove the option from the local state array
      const newOptions = [
        ...this.pages.find((page) => page.id === pageId).options,
      ];
      newOptions.splice(optionIndex, 1); // This removes the item at `optionIndex`

      // Update the document in Firestore with the new array
      const pageRef = doc(db, "pages", pageId);
      await updateDoc(pageRef, {
        options: newOptions,
      });

      runInAction(() => {
        const index = this.pages.findIndex((page) => page.id === pageId);
        if (index !== -1) {
          this.pages[index].options = newOptions;
        }

        if (this.activePage.id === pageId) {
          this.activePage.options = newOptions;
        }
        this.loading = false;
      });
    } catch (error) {
      console.error("Error deleting option from page:", error);
      this.loading = false;
    }
  }

  // Stats
  async fetchStats(projectId) {
    this.loading = true;
    try {
      const q = query(
        collection(db, "stats"),
        where("projectId", "==", projectId)
      );
      const querySnapshot = await getDocs(q);
      const stats = [];
      querySnapshot.forEach((doc) => {
        stats.push({ id: doc.id, ...doc.data() });
      });
      runInAction(() => {
        this.stats = stats;
        this.loading = false;
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      this.loading = false;
    }
  }

  async createStatWithImage(projectId, statData, imageFile) {
    this.loading = true;

    try {
      if (!imageFile) {
        throw new Error("No image file provided.");
      }

      // Assuming the user's ID is correctly set in your store as this.user.uid
      const storage = getStorage();

      const imageFileName = encodeURIComponent(imageFile.name); // Handle special characters in filename

      const storagePath = `projects/${projectId}/stats/${imageFileName}`;

      const imageRef = storageRef(storage, storagePath);

      const uploadResult = await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      const newStatData = { ...statData, imageUrl };
      const newStatRef = await addDoc(collection(db, "stats"), {
        ...newStatData,
        projectId: projectId,
      });

      runInAction(() => {
        this.stats.push({ id: newStatRef.id, ...newStatData });
        this.loading = false;
      });
    } catch (error) {
      console.error("Error creating stat with image:", error);
      this.loading = false;
    }
  }

  async updateStatWithImage(existingStat, projectId, updateData, newImageFile) {
    const statId = existingStat.id;
    const existingUrl = existingStat.imageUrl;

    this.loading = true;
    try {
      if (newImageFile) {
        const storage = getStorage();
        if (existingUrl) {
          const imageRef = storageRef(storage, existingUrl);
          await deleteObject(imageRef);
        }

        const imageFileName = encodeURIComponent(newImageFile.name);
        const storagePath = `projects/${projectId}/stats/${imageFileName}`;
        const imageRef = storageRef(storage, storagePath);
        await uploadBytes(imageRef, newImageFile);
        const imageUrl = await getDownloadURL(imageRef);
        updateData.imageUrl = imageUrl;
      }

      const statRef = doc(db, "stats", statId);
      await updateDoc(statRef, updateData);

      runInAction(() => {
        const index = this.stats.findIndex((stat) => stat.id === statId);
        if (index !== -1) {
          this.stats[index] = { ...this.stats[index], ...updateData };
        }
        this.loading = false;
      });
    } catch (error) {
      console.error("Error updating stat with image:", error);
      this.loading = false;
    }
  }

  async deleteStat(statId, imagePath) {
    this.loading = true;
    try {
      await deleteDoc(doc(db, "stats", statId));

      const storage = getStorage();

      const imageRef = storageRef(storage, imagePath);

      await deleteObject(imageRef);

      runInAction(() => {
        this.stats = this.stats.filter((stat) => stat.id !== statId);

        this.loading = false;
      });
    } catch (error) {
      console.error("Error deleting stat and image:", error);
      this.loading = false;
    }
  }

  // Items
  async fetchItems(projectId) {
    this.loading = true;
    try {
      const q = query(
        collection(db, "items"),
        where("projectId", "==", projectId)
      );
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      runInAction(() => {
        this.items = items;
        this.loading = false;
      });
    } catch (error) {
      console.error("Error fetching items:", error);
      this.loading = false;
    }
  }

  async createItemWithImage(projectId, itemData, imageFile) {
    this.loading = true;

    try {
      if (!imageFile) {
        throw new Error("No image file provided.");
      }

      // Assuming the user's ID is correctly set in your store as this.user.uid
      const storage = getStorage();

      const imageFileName = encodeURIComponent(imageFile.name); // Handle special characters in filename

      const storagePath = `projects/${projectId}/items/${imageFileName}`;

      const imageRef = storageRef(storage, storagePath);

      const uploadResult = await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      // Add the imageUrl to itemData and create the item document in Firestore
      const newItemData = { ...itemData, imageUrl };
      const newItemRef = await addDoc(collection(db, "items"), {
        ...newItemData,
        projectId: projectId,
      });

      runInAction(() => {
        this.items.push({ id: newItemRef.id, ...newItemData });
        this.loading = false;
      });
    } catch (error) {
      console.error("Error creating item with image:", error);
      this.loading = false;
    }
  }

  async updateItemWithImage(existingItem, projectId, updateData, newImageFile) {
    const itemId = existingItem.id;
    const existingUrl = existingItem.imageUrl;

    this.loading = true;
    try {
      if (newImageFile) {
        const storage = getStorage();
        if (existingUrl) {
          const imageRef = storageRef(storage, existingUrl);
          await deleteObject(imageRef);
        }

        const imageFileName = encodeURIComponent(newImageFile.name);
        const storagePath = `projects/${projectId}/items/${imageFileName}`;
        const imageRef = storageRef(storage, storagePath);
        await uploadBytes(imageRef, newImageFile);
        const imageUrl = await getDownloadURL(imageRef);
        updateData.imageUrl = imageUrl;
      }

      const itemRef = doc(db, "items", itemId);
      await updateDoc(itemRef, updateData);

      runInAction(() => {
        const index = this.items.findIndex((item) => item.id === itemId);
        if (index !== -1) {
          this.items[index] = { ...this.items[index], ...updateData };
        }
        this.loading = false;
      });
    } catch (error) {
      console.error("Error updating item with image:", error);
      this.loading = false;
    }
  }

  async deleteItem(itemId, imagePath) {
    this.loading = true;
    try {
      await deleteDoc(doc(db, "items", itemId));

      const storage = getStorage();

      const imageRef = storageRef(storage, imagePath);

      await deleteObject(imageRef);

      runInAction(() => {
        this.items = this.items.filter((item) => item.id !== itemId);

        this.loading = false;
      });
    } catch (error) {
      console.error("Error deleting item and image:", error);
      this.loading = false;
    }
  }

  // Projects
  async createProject(projectData) {
    this.loading = true;
    try {
      // Extract the image file from projectData
      const { imageFile, ...projectInfo } = projectData;
      if (!imageFile) {
        throw new Error("No image file provided.");
      }

      // Upload image to Firebase Storage
      const userId = this.user.uid; // Ensure this is set correctly in your store
      const storage = getStorage();
      const imageFileName = encodeURIComponent(imageFile.name); // Handle special characters in filename
      const projectId = new Date().getTime(); // Simple way to generate a unique ID for the project, consider using Firestore to generate IDs
      const storagePath = `users/${userId}/projects/${projectId}/${imageFileName}`;
      const imageRef = storageRef(storage, storagePath);

      const uploadResult = await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      // Create project document in Firestore with imageUrl
      const newProjectRef = await addDoc(collection(db, "projects"), {
        ...projectInfo,
        creatorId: userId,
        imageUrl, // Include the imageUrl in the project document
        status: "in progress", // Default status
      });

      runInAction(() => {
        this.projects.push({ id: newProjectRef.id, ...projectInfo, imageUrl });
        this.loading = false;
      });
    } catch (error) {
      console.error("Error creating project:", error);
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async updateProject(projectId, updates) {
    try {
      this.loading = true;
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, updates);
      runInAction(() => {
        const projectIndex = this.projects.findIndex(
          (project) => project.id === projectId
        );
        if (projectIndex !== -1) {
          this.projects[projectIndex] = {
            ...this.projects[projectIndex],
            ...updates,
          };
        }
        this.loading = false;
      });
    } catch (error) {
      console.error("Error updating project:", error);
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async deleteProject(projectId) {
    try {
      this.loading = true;
      const projectRef = doc(db, "projects", projectId);
      await deleteDoc(projectRef);
      runInAction(() => {
        this.projects = this.projects.filter(
          (project) => project.id !== projectId
        );
        this.loading = false;
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async uploadProjectAvatar(projectId, imageFile) {
    this.loading = true;
    try {
      if (!imageFile) {
        throw new Error("No image file provided.");
      }

      const storage = getStorage();
      const imageFileName = encodeURIComponent(imageFile.name);
      const storagePath = `projects/${projectId}/avatar/${imageFileName}`;
      const imageRef = storageRef(storage, storagePath);

      const uploadResult = await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, { imageUrl, imgFileName: imageFileName });

      runInAction(() => {
        const projectIndex = this.projects.findIndex(
          (proj) => proj.id === projectId
        );
        if (projectIndex !== -1) {
          this.projects[projectIndex] = {
            ...this.projects[projectIndex],
            imageUrl: imageUrl,
            imgFileName: imageFileName,
          };
        }
        this.loading = false;
      });
    } catch (error) {
      console.error("Error uploading project avatar:", error);
      this.loading = false;
    }
  }

  async removeProjectAvatar(projectId, imgFilename) {
    this.loading = true;
    try {
      const storage = getStorage();

      const storagePath = `projects/${projectId}/avatar/${imgFilename}`;

      const imageRef = storageRef(storage, storagePath);

      await deleteObject(imageRef);

      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        imageUrl: null,
        imgFileName: null,
      });

      runInAction(() => {
        const projectIndex = this.projects.findIndex(
          (proj) => proj.id === projectId
        );
        if (projectIndex !== -1) {
          this.projects[projectIndex] = {
            ...this.projects[projectIndex],
            imageUrl: null,
            imageFileName: null,
          };
        }
        this.loading = false;
      });
    } catch (error) {
      console.error("Error removing project avatar:", error);
      this.loading = false;
    }
  }

  async getProjects() {
    if (!this.user.uid) return;

    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, where("creatorId", "==", this.user.uid));

    getDocs(q)
      .then((querySnapshot) => {
        const projects = [];
        querySnapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() });
        });
        runInAction(() => {
          this.projects = projects;
        });
      })
      .catch((error) => {
        console.error("Error fetching projects: ", error);
      });
  }

  // Game State

  useOption(optionIndex) {
    const pageUsage = this.usedOptions.find(
      (usage) => usage.page === this.activePage.page
    );
    if (pageUsage) {
      // If the page already has used options tracked, push the new optionIndex
      pageUsage.optionIndexes.push(optionIndex);
    } else {
      // If it's the first time an option on this page is used, add a new entry
      this.usedOptions.push({
        page: this.activePage.page,
        optionIndexes: [optionIndex],
      });
    }
  }

  getOptionUsage(optionIndex) {
    const pageUsage = this.usedOptions.find(
      (usage) => usage.page === this.activePage.page
    );
    if (!pageUsage) return 0; // If no usage found for the page, return 0
    return pageUsage.optionIndexes.filter((index) => index === optionIndex)
      .length;
  }

  findStat = (statId) => {
    return this.stats.find((stat) => stat.id === statId);
  };

  findItem = (itemId) => {
    return this.items.find((item) => item.id === itemId);
  };

  setActivePage = (pageNum) => {
    const newPage = this.pages.find((p) => p.page === parseInt(pageNum));
    if (newPage) {
      runInAction(() => {
        this.activePage = newPage;
      });
    } else {
      console.log("Page not found");
    }
  };

  updateStat = (gain_stat) => {
    const statId = gain_stat.statId;
    const statIndex = this.stats.findIndex((stat) => stat.id === statId);
    if (statIndex !== -1) {
      runInAction(() => {
        if (gain_stat.operation === "+") {
          this.stats[statIndex].value += gain_stat.value;
        } else if (gain_stat.operation == "-") {
          this.stats[statIndex].value -= gain_stat.value;
        }
      });
    }
  };

  addItemToInventory = (itemId) => {
    const itemToAdd = this.items.find((item) => item.id === itemId);
    if (itemToAdd) {
      runInAction(() => {
        this.inventory.push(itemToAdd);
      });
    }
  };

  removeItemFromInventory = (itemId) => {
    const itemIndex = this.inventory.findIndex((item) => item.id === itemId);
    if (itemIndex !== -1) {
      runInAction(() => {
        this.inventory.splice(itemIndex, 1);
      });
    }
  };

  reduceStat = ({ statId, value }) => {
    const statIndex = this.stats.findIndex((stat) => stat.id === statId);
    if (statIndex !== -1) {
      runInAction(() => {
        this.stats[statIndex].value -= value;
      });
    }
  };

  handleOptionClick = (option, optionIndex) => {
    const usageCount = this.getOptionUsage(optionIndex);
    if (option.uses && usageCount >= option.uses) {
      console.log("This option has been used the maximum number of times.");
      return;
    }

    if (option.uses) {
      this.useOption(optionIndex);
    }

    if (option.page) {
      this.setActivePage(option.page);
    }

    if (option.gain_stat) {
      this.updateStat(option.gain_stat);
    }

    if (option.gain_item) {
      this.addItemToInventory(option.gain_item);
    }

    if (option.blocked?.requirement == "give item") {
      removeItemFromInventory(option.blocked.itemId);
    }

    if (option.blocked?.requirement == "give stat") {
      this.reduceStat(option.blocked.stat);
    }
  };

  hasItem(itemId) {
    return this.inventory.some((item) => item.id === itemId);
  }

  meetsStatCondition(blocked) {
    const { statId, operation, value } = blocked.stat;
    const stat = this.stats.find((stat) => stat.id === statId);

    if (!stat) return false; // Stat not found

    if (blocked.requirement === "give stat") {
      return stat.value >= value;
    }

    switch (operation) {
      case "<":
        return stat.value < value;
      case ">":
        return stat.value > value;
      case "=":
        return stat.value == value;
      default:
        console.error("Invalid operator", operation);
        return false; // Invalid operator
    }
  }

  isOptionUnlocked = (blocked) => {
    if (blocked.item) {
      return this.hasItem(blocked.item);
    }

    if (blocked.stat) {
      return this.meetsStatCondition(blocked);
    }

    // Assuming every condition has either an item or stat check,
    // but adding a default true in case a new type of condition without checks is added.
    return true;
  };

  checkPageNumberExists = (pageNum) => {
    return this.pages.some((p) => p.page == pageNum);
  };

  findMissingPagesFromOptions = () => {
    const missingPages = [];
    for (const page of this.pages) {
      for (const option of page.options || []) {
        if (option.page && !this.checkPageNumberExists(parseInt(option.page))) {
          missingPages.push({
            foundIn: { page: page.page, option: option.label },
            missingPage: option.page,
          });
        }
      }
    }
    return missingPages;
  };

  // Authentication
  async loginWithEmail({ email, password }) {
    try {
      this.loading = true;
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      runInAction(() => {
        this.user = userCredential.user;
        this.loading = false;
      });
    } catch (error) {
      console.error("Error logging in:", error);
      runInAction(() => {
        this.loading = false;
      });
      throw error;
    }
  }

  async signupWithEmail(email, password, username) {
    try {
      this.loading = true;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Additional user properties
      const newUserProfile = {
        ...DEFAULT_USER,
        createdAt: new Date(),
        username: username,
        email: email,
        uid: userCredential.user.uid,
      };

      // Create a user profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), newUserProfile);

      runInAction(() => {
        this.user = newUserProfile;
        this.loading = false;
      });
    } catch (error) {
      console.error("Error signing up:", error);
      runInAction(() => {
        this.loading = false;
      });
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth); // Sign out from Firebase Authentication
      runInAction(() => {
        this.user = null; // Reset the user in the store
      });
    } catch (error) {
      console.error("Error during logout:", error);
      // Handle any errors that occur during logout
    }
  }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const newUserProfile = {
          ...DEFAULT_USER,
          createdAt: new Date(),
          username: user.displayName || "New User",
          email: user.email,
          uid: user.uid,
        };

        await setDoc(userDocRef, newUserProfile);

        runInAction(() => {
          this.user = newUserProfile;
        });
      } else {
        runInAction(() => {
          this.user = { uid: user.uid, ...userDoc.data() };
        });
      }
    } catch (error) {
      console.error("Error with Google sign-in:", error);
    }
  }

  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      // Handle success, such as showing a message to the user
    } catch (error) {
      console.error("Error sending password reset email:", error);
      // Handle errors, such as invalid email, etc.
    }
  }
}

const MobxStore = new Store();
export default MobxStore;
